/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar ESLint durante build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desabilitar verificação de tipos durante build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurar para não gerar páginas estáticas
  experimental: {
    // Forçar todas as páginas a serem dinâmicas
  },
};

module.exports = nextConfig;
