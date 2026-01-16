{ pkgs, ... }: {
  # Pacotes necessários
  packages = [
    pkgs.nodejs_20
    pkgs.pnpm
    pkgs.dotnet-sdk_8
    pkgs.docker
    pkgs.docker-compose
    pkgs.postgresql
    pkgs.redis
  ];

  # Variáveis de ambiente
  env = {
    DOTNET_ROOT = "${pkgs.dotnet-sdk_8}";
    NODE_VERSION = "20";
  };

  # Configuração do ambiente
  bootstrap = ''
    # Instalar dependências Node.js
    pnpm install

    # Restaurar pacotes .NET
    cd apps/api && dotnet restore
    
    # Gerar tipos TypeScript do backend
    pnpm generate:types
    
    echo "✅ Ambiente configurado com sucesso!"
  '';

  # Serviços (processos em background)
  services = {
    # PostgreSQL
    postgres = {
      enable = true;
      package = pkgs.postgresql;
    };

    # Redis
    redis = {
      enable = true;
      package = pkgs.redis;
    };
  };

  # IDX Workspace
  idx = {
    # Extensões recomendadas
    extensions = [
      "ms-dotnettools.csharp"
      "ms-dotnettools.csdevkit"
      "bradlc.vscode-tailwindcss"
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
      "humao.rest-client"
    ];

    # Preview do app
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "dev:web"];
          manager = "web";
          env = {
            PORT = "3000";
          };
        };
        api = {
          command = ["pnpm" "dev:api"];
          manager = "web";
          env = {
            ASPNETCORE_URLS = "http://localhost:4000";
          };
        };
      };
    };

    # Workspace configuration
    workspace = {
      onCreate = {
        install = "pnpm install && cd apps/api && dotnet restore";
      };
      onStart = {
        watch-frontend = "pnpm dev:web";
      };
    };
  };
}
