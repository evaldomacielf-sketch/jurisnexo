{ pkgs, ... }: {
  channel = "stable-23.11";

  packages = [
    pkgs.nodejs_20
    pkgs.dotnet-sdk_8
    pkgs.pnpm
    pkgs.git
    pkgs.docker
    pkgs.docker-compose
  ];

  env = {
    ASPNETCORE_ENVIRONMENT = "Development";
  };

  idx = {
    extensions = [
      "ms-dotnettools.csdevkit"
      "ms-vscode.azure-account"
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
    ];

    workspace = {
      onCreate = {
        pnpm-install = "pnpm install";
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "dev" "--filter" "web"];
          manager = "web";
        };
      };
    };
  };
}
