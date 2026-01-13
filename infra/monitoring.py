from google.cloud import monitoring_v3
import time
import os

# Configuration
PROJECT_ID = os.environ.get('PROJECT_ID', 'jurisnexo-prod')
HOST = os.environ.get('HOST', 'api.jurisnexo.com')

def create_uptime_check():
    client = monitoring_v3.UptimeCheckServiceClient()
    project_name = f"projects/{PROJECT_ID}"

    print(f"Creating uptime check for {HOST} in project {PROJECT_ID}...")

    # Create uptime check config
    config = monitoring_v3.UptimeCheckConfig(
        display_name="JurisNexo API Health",
        monitored_resource=monitoring_v3.MonitoredResource(
            type="uptime_url",
            labels={"host": HOST}
        ),
        http_check=monitoring_v3.UptimeCheckConfig.HttpCheck(
            path="/health",
            port=443,
            use_ssl=True,
            validate_ssl=True
        ),
        period={"seconds": 60},
        timeout={"seconds": 10}
    )

    uptime_check = client.create_uptime_check_config(
        parent=project_name,
        uptime_check_config=config
    )

    print(f"✅ Created uptime check: {uptime_check.name}")
    print(f"   Display Name: {uptime_check.display_name}")
    print(f"   Resource: {uptime_check.monitored_resource.labels['host']}")

if __name__ == "__main__":
    create_uptime_check()
