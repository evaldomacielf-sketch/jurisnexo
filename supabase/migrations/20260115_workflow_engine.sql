-- Migration: Workflow Engine Tables
-- Supports workflow definitions, executions, and scheduling
-- ============================================
-- Workflows Table
-- ============================================
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id);
CREATE INDEX idx_workflows_trigger ON workflows(trigger_type);
CREATE INDEX idx_workflows_active ON workflows(is_active);
-- ============================================
-- Workflow Executions Table
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'running',
            'completed',
            'failed',
            'cancelled'
        )
    ),
    trigger_event JSONB NOT NULL DEFAULT '{}',
    step_results JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_started ON workflow_executions(started_at DESC);
-- ============================================
-- Scheduled Workflows Table
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    cron_expression TEXT NOT NULL,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_schedules_workflow ON workflow_schedules(workflow_id);
CREATE INDEX idx_schedules_next_run ON workflow_schedules(next_run_at)
WHERE is_active = true;
-- ============================================
-- Tasks Table (for task action executor)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES users(id),
    case_id UUID REFERENCES cases(id),
    client_id UUID REFERENCES clients(id),
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    source TEXT DEFAULT 'manual',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_case ON tasks(case_id);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
-- ============================================
-- Notifications Table (for notification action executor)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    link TEXT,
    metadata JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    source TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id)
WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
-- ============================================
-- RLS Policies
-- ============================================
-- Workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflows_tenant_policy ON workflows FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- Executions
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY executions_tenant_policy ON workflow_executions FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- Schedules
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY schedules_tenant_policy ON workflow_schedules FOR ALL USING (
    workflow_id IN (
        SELECT id
        FROM workflows
        WHERE tenant_id = current_setting('app.tenant_id')::UUID
    )
);
-- Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_tenant_policy ON tasks FOR ALL USING (
    tenant_id = current_setting('app.tenant_id')::UUID
);
-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_user_policy ON notifications FOR ALL USING (user_id = auth.uid());
-- ============================================
-- Trigger to update workflow execution count
-- ============================================
CREATE OR REPLACE FUNCTION update_workflow_execution_count() RETURNS TRIGGER AS $$ BEGIN IF NEW.status = 'completed' THEN
UPDATE workflows
SET execution_count = execution_count + 1,
    last_executed_at = NOW()
WHERE id = NEW.workflow_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_workflow_execution_count
AFTER
UPDATE ON workflow_executions FOR EACH ROW
    WHEN (
        OLD.status IS DISTINCT
        FROM NEW.status
    ) EXECUTE FUNCTION update_workflow_execution_count();
-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE workflows IS 'Workflow definitions with triggers and action steps';
COMMENT ON TABLE workflow_executions IS 'Execution history for workflows';
COMMENT ON TABLE workflow_schedules IS 'Scheduled triggers for workflows';
COMMENT ON TABLE tasks IS 'Tasks created by workflows or manually';
COMMENT ON TABLE notifications IS 'In-app notifications for users';