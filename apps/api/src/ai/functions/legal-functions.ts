import OpenAI from 'openai';
import { DatabaseService } from '../../database/database.service';
import { addBusinessDays, differenceInBusinessDays, format, parse, isWeekend, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// Legal Function Definitions for OpenAI
// ============================================

export const legalFunctions: OpenAI.Chat.ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'calcular_prazo',
            description: 'Calcula prazos processuais considerando dias úteis e feriados forenses',
            parameters: {
                type: 'object',
                properties: {
                    data_inicial: {
                        type: 'string',
                        description: 'Data inicial no formato DD/MM/YYYY',
                    },
                    dias_prazo: {
                        type: 'number',
                        description: 'Quantidade de dias do prazo',
                    },
                    tipo_prazo: {
                        type: 'string',
                        enum: ['uteis', 'corridos'],
                        description: 'Se são dias úteis ou corridos',
                    },
                },
                required: ['data_inicial', 'dias_prazo', 'tipo_prazo'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'buscar_processo',
            description: 'Busca informações de um processo pelo número',
            parameters: {
                type: 'object',
                properties: {
                    numero_processo: {
                        type: 'string',
                        description: 'Número do processo (formato CNJ ou livre)',
                    },
                },
                required: ['numero_processo'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'buscar_cliente',
            description: 'Busca informações de um cliente pelo nome ou CPF/CNPJ',
            parameters: {
                type: 'object',
                properties: {
                    termo: {
                        type: 'string',
                        description: 'Nome, CPF ou CNPJ do cliente',
                    },
                },
                required: ['termo'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'listar_prazos_proximos',
            description: 'Lista os próximos prazos processuais a vencer',
            parameters: {
                type: 'object',
                properties: {
                    dias: {
                        type: 'number',
                        description: 'Quantidade de dias para buscar (ex: próximos 7 dias)',
                    },
                },
                required: ['dias'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'calcular_juros_correcao',
            description: 'Calcula juros e correção monetária de um valor',
            parameters: {
                type: 'object',
                properties: {
                    valor_original: {
                        type: 'number',
                        description: 'Valor original em reais',
                    },
                    data_inicial: {
                        type: 'string',
                        description: 'Data inicial da dívida (DD/MM/YYYY)',
                    },
                    indice: {
                        type: 'string',
                        enum: ['SELIC', 'IPCA', 'INPC', 'IGP-M'],
                        description: 'Índice de correção',
                    },
                    juros_mensal: {
                        type: 'number',
                        description: 'Taxa de juros mensal (%)',
                    },
                },
                required: ['valor_original', 'data_inicial', 'indice'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'verificar_prescricao',
            description: 'Verifica se um caso está prescrito com base na legislação',
            parameters: {
                type: 'object',
                properties: {
                    tipo_acao: {
                        type: 'string',
                        description: 'Tipo da ação (trabalhista, cível, penal, etc.)',
                    },
                    data_fato: {
                        type: 'string',
                        description: 'Data do fato gerador (DD/MM/YYYY)',
                    },
                    tipo_parte: {
                        type: 'string',
                        enum: ['pessoa_fisica', 'pessoa_juridica', 'fazenda_publica'],
                        description: 'Tipo da parte envolvida',
                    },
                },
                required: ['tipo_acao', 'data_fato'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'gerar_minuta',
            description: 'Gera uma minuta de documento jurídico',
            parameters: {
                type: 'object',
                properties: {
                    tipo_documento: {
                        type: 'string',
                        enum: ['peticao_inicial', 'contestacao', 'recurso', 'contrato', 'procuracao', 'notificacao'],
                        description: 'Tipo do documento a ser gerado',
                    },
                    dados: {
                        type: 'object',
                        description: 'Dados para preencher o documento',
                        properties: {
                            partes: { type: 'string' },
                            objeto: { type: 'string' },
                            fatos: { type: 'string' },
                            fundamentos: { type: 'string' },
                        },
                    },
                },
                required: ['tipo_documento'],
            },
        },
    },
];

// ============================================
// Function Executors
// ============================================

export async function executeLegalFunction(
    functionName: string,
    args: any,
    tenantId: string,
    database: DatabaseService,
): Promise<any> {
    switch (functionName) {
        case 'calcular_prazo':
            return calcularPrazo(args.data_inicial, args.dias_prazo, args.tipo_prazo);

        case 'buscar_processo':
            return buscarProcesso(args.numero_processo, tenantId, database);

        case 'buscar_cliente':
            return buscarCliente(args.termo, tenantId, database);

        case 'listar_prazos_proximos':
            return listarPrazosProximos(args.dias, tenantId, database);

        case 'calcular_juros_correcao':
            return calcularJurosCorrecao(args);

        case 'verificar_prescricao':
            return verificarPrescricao(args);

        case 'gerar_minuta':
            return gerarMinuta(args.tipo_documento, args.dados);

        default:
            return { error: `Função desconhecida: ${functionName}` };
    }
}

// ============================================
// Function Implementations
// ============================================

function calcularPrazo(dataInicial: string, diasPrazo: number, tipoPrazo: 'uteis' | 'corridos') {
    try {
        const inicio = parse(dataInicial, 'dd/MM/yyyy', new Date());
        let dataFinal: Date;

        if (tipoPrazo === 'uteis') {
            // Add business days (weekends excluded)
            dataFinal = addBusinessDays(inicio, diasPrazo);
        } else {
            dataFinal = addDays(inicio, diasPrazo);
        }

        // Check if final date falls on weekend
        if (isWeekend(dataFinal)) {
            dataFinal = addBusinessDays(dataFinal, 1);
        }

        return {
            data_inicial: format(inicio, 'dd/MM/yyyy', { locale: ptBR }),
            dias_prazo: diasPrazo,
            tipo_prazo: tipoPrazo,
            data_final: format(dataFinal, 'dd/MM/yyyy', { locale: ptBR }),
            dia_semana_final: format(dataFinal, 'EEEE', { locale: ptBR }),
            dias_corridos: Math.round((dataFinal.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)),
            observacao: 'Não foram considerados feriados forenses. Verifique o calendário do tribunal.',
        };
    } catch (error) {
        return { error: 'Data inválida. Use o formato DD/MM/YYYY.' };
    }
}

async function buscarProcesso(numeroProcesso: string, tenantId: string, database: DatabaseService) {
    // Remove formatting
    const numeroLimpo = numeroProcesso.replace(/[^\d]/g, '');

    const { data, error } = await database.client
        .from('cases')
        .select(`
            *,
            client:clients(id, name, document_number),
            lawyer:users(id, name)
        `)
        .eq('tenant_id', tenantId)
        .or(`number.ilike.%${numeroLimpo}%,number.ilike.%${numeroProcesso}%`)
        .limit(5);

    if (error) {
        return { error: 'Erro ao buscar processo.' };
    }

    if (!data || data.length === 0) {
        return {
            encontrado: false,
            mensagem: `Nenhum processo encontrado com o número ${numeroProcesso} na base do escritório.`,
        };
    }

    return {
        encontrado: true,
        quantidade: data.length,
        processos: data.map((p: any) => ({
            id: p.id,
            numero: p.number,
            titulo: p.title,
            status: p.status,
            cliente: p.client?.name,
            advogado: p.lawyer?.name,
            vara: p.court,
            valor_causa: p.amount,
            data_distribuicao: p.distribution_date,
        })),
    };
}

async function buscarCliente(termo: string, tenantId: string, database: DatabaseService) {
    const termoLimpo = termo.replace(/[^\d\w\s]/g, '');

    const { data, error } = await database.client
        .from('clients')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`name.ilike.%${termoLimpo}%,document_number.ilike.%${termoLimpo}%`)
        .limit(5);

    if (error) {
        return { error: 'Erro ao buscar cliente.' };
    }

    if (!data || data.length === 0) {
        return {
            encontrado: false,
            mensagem: `Nenhum cliente encontrado com "${termo}".`,
        };
    }

    return {
        encontrado: true,
        quantidade: data.length,
        clientes: data.map((c: any) => ({
            id: c.id,
            nome: c.name,
            documento: c.document_number,
            email: c.email,
            telefone: c.phone,
            tipo: c.type,
        })),
    };
}

async function listarPrazosProximos(dias: number, tenantId: string, database: DatabaseService) {
    const hoje = new Date();
    const dataLimite = addDays(hoje, dias);

    const { data, error } = await database.client
        .from('case_deadlines')
        .select(`
            *,
            case:cases(id, number, title, client:clients(name))
        `)
        .eq('tenant_id', tenantId)
        .gte('deadline_date', format(hoje, 'yyyy-MM-dd'))
        .lte('deadline_date', format(dataLimite, 'yyyy-MM-dd'))
        .order('deadline_date', { ascending: true })
        .limit(20);

    if (error) {
        return { error: 'Erro ao buscar prazos.' };
    }

    if (!data || data.length === 0) {
        return {
            quantidade: 0,
            mensagem: `Nenhum prazo nos próximos ${dias} dias.`,
        };
    }

    return {
        quantidade: data.length,
        prazos: data.map((p: any) => ({
            id: p.id,
            tipo: p.type,
            descricao: p.description,
            data: format(new Date(p.deadline_date), 'dd/MM/yyyy', { locale: ptBR }),
            dias_restantes: differenceInBusinessDays(new Date(p.deadline_date), hoje),
            processo: p.case?.number,
            cliente: p.case?.client?.name,
        })),
    };
}

function calcularJurosCorrecao(args: {
    valor_original: number;
    data_inicial: string;
    indice: string;
    juros_mensal?: number;
}) {
    const dataInicial = parse(args.data_inicial, 'dd/MM/yyyy', new Date());
    const hoje = new Date();
    const meses = Math.max(1, Math.round((hoje.getTime() - dataInicial.getTime()) / (1000 * 60 * 60 * 24 * 30)));

    // Simplified calculation (in production, use real index data)
    const taxasAnuais: Record<string, number> = {
        'SELIC': 0.1075, // ~10.75% ao ano
        'IPCA': 0.045,   // ~4.5% ao ano
        'INPC': 0.042,   // ~4.2% ao ano
        'IGP-M': 0.038,  // ~3.8% ao ano
    };

    const taxaAnual = taxasAnuais[args.indice] || 0.05;
    const correcaoMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const jurosMensal = (args.juros_mensal || 1) / 100;

    const valorCorrigido = args.valor_original * Math.pow(1 + correcaoMensal, meses);
    const jurosAcumulados = args.valor_original * jurosMensal * meses;
    const valorTotal = valorCorrigido + jurosAcumulados;

    return {
        valor_original: args.valor_original.toFixed(2),
        data_inicial: args.data_inicial,
        data_calculo: format(hoje, 'dd/MM/yyyy'),
        meses_decorridos: meses,
        indice: args.indice,
        valor_corrigido: valorCorrigido.toFixed(2),
        juros_taxa: `${(args.juros_mensal || 1)}% ao mês`,
        juros_acumulados: jurosAcumulados.toFixed(2),
        valor_total: valorTotal.toFixed(2),
        observacao: 'Cálculo estimativo. Para valores oficiais, utilize calculadoras homologadas.',
    };
}

function verificarPrescricao(args: { tipo_acao: string; data_fato: string; tipo_parte?: string }) {
    const dataFato = parse(args.data_fato, 'dd/MM/yyyy', new Date());
    const hoje = new Date();
    const anosDecorridos = (hoje.getTime() - dataFato.getTime()) / (1000 * 60 * 60 * 24 * 365);

    // Simplified prescription periods (in production, use complete legal database)
    const prazosAnos: Record<string, { prazo: number; fundamento: string }> = {
        'trabalhista': { prazo: 2, fundamento: 'Art. 7º, XXIX, CF/88 e Art. 11, CLT' },
        'civel_geral': { prazo: 10, fundamento: 'Art. 205, CC/2002' },
        'civel_indenizacao': { prazo: 3, fundamento: 'Art. 206, §3º, V, CC/2002' },
        'civel_cobranca': { prazo: 5, fundamento: 'Art. 206, §5º, I, CC/2002' },
        'consumerista': { prazo: 5, fundamento: 'Art. 27, CDC' },
        'penal': { prazo: 20, fundamento: 'Art. 109, CP - varia conforme pena' },
        'tributaria': { prazo: 5, fundamento: 'Art. 174, CTN' },
        'fazenda_publica': { prazo: 5, fundamento: 'Decreto 20.910/32' },
    };

    const tipoNormalizado = args.tipo_acao.toLowerCase().replace(/[^\w]/g, '_');
    const regra = prazosAnos[tipoNormalizado] || prazosAnos['civel_geral'];

    const prescreveu = anosDecorridos > regra.prazo;
    const dataPrescricao = addDays(dataFato, regra.prazo * 365);

    return {
        tipo_acao: args.tipo_acao,
        data_fato: args.data_fato,
        prazo_prescricional_anos: regra.prazo,
        fundamento_legal: regra.fundamento,
        data_prescricao: format(dataPrescricao, 'dd/MM/yyyy'),
        anos_decorridos: anosDecorridos.toFixed(1),
        prescreveu,
        status: prescreveu ? '⚠️ PRESCRITO' : '✅ NÃO PRESCRITO',
        observacao: 'Análise simplificada. Verifique causas suspensivas e interruptivas.',
    };
}

function gerarMinuta(tipoDocumento: string, dados?: any) {
    const templates: Record<string, string> = {
        peticao_inicial: `
# PETIÇÃO INICIAL

## EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE ___

${dados?.partes || '[QUALIFICAÇÃO DAS PARTES]'}

vem, respeitosamente, à presença de Vossa Excelência, por seu advogado infra-assinado, propor a presente

**AÇÃO DE ${dados?.objeto?.toUpperCase() || '[TIPO DA AÇÃO]'}**

em face de [RÉU], pelos fatos e fundamentos a seguir expostos:

## I - DOS FATOS

${dados?.fatos || '[Narrar os fatos que fundamentam o pedido]'}

## II - DO DIREITO

${dados?.fundamentos || '[Fundamentação jurídica com citação de artigos e jurisprudência]'}

## III - DOS PEDIDOS

Ante o exposto, requer:

a) A citação do réu para, querendo, contestar a presente ação;
b) A procedência dos pedidos para [especificar];
c) A condenação do réu ao pagamento das custas e honorários advocatícios.

Dá-se à causa o valor de R$ [VALOR].

Nestes termos, pede deferimento.

[Local], [Data]

_______________________
[ADVOGADO]
OAB/[UF] nº [NÚMERO]
        `,
        contestacao: `
# CONTESTAÇÃO

## EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...

[QUALIFICAÇÃO DO RÉU], já qualificado nos autos em epígrafe, vem apresentar

**CONTESTAÇÃO**

pelos fatos e fundamentos a seguir:

## I - PRELIMINARES
[Arguir preliminares se houver]

## II - DO MÉRITO
[Refutar os fatos e fundamentos do autor]

## III - DOS PEDIDOS
[Pedidos de improcedência]

Nestes termos, pede deferimento.
        `,
        procuracao: `
# PROCURAÇÃO AD JUDICIA ET EXTRA

[OUTORGANTE], [QUALIFICAÇÃO], nomeia e constitui seu bastante procurador o(a) Dr(a). [ADVOGADO], inscrito(a) na OAB/[UF] sob nº [NÚMERO], com escritório na [ENDEREÇO], para representá-lo(a) em juízo e fora dele, podendo propor ações, contestar, recorrer, transigir, acordar, desistir, dar e receber quitação, substabelecer com ou sem reservas de iguais poderes, e praticar todos os atos necessários ao bom desempenho deste mandato.

[Local], [Data]

_______________________
[OUTORGANTE]
        `,
    };

    const template = templates[tipoDocumento];
    if (!template) {
        return {
            erro: true,
            mensagem: `Tipo de documento "${tipoDocumento}" não disponível. Tipos disponíveis: ${Object.keys(templates).join(', ')}`,
        };
    }

    return {
        tipo: tipoDocumento,
        minuta: template,
        instrucoes: [
            'Revise e complete as informações entre colchetes []',
            'Adicione fundamentação jurídica específica para o caso',
            'Verifique a competência do juízo',
            'Anexe documentos comprobatórios',
        ],
    };
}
