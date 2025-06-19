#!/bin/bash

# Cria symlinks dos arquivos de configuração na raiz do projeto
set -e

CONFIGS=(app.config.js app.json babel.config.js eas.json eslint.config.js tsconfig.json)

for file in "${CONFIGS[@]}"; do
  if [ -f "config/$file" ]; then
    ln -sf "config/$file" "./$file"
    echo "Symlink criado: $file -> config/$file"
  fi

done

echo "Todos os symlinks de configuração foram criados!" 