/** PM2: muru-storefront (Next.js production server on PORT 3000). */
module.exports = {
  apps: [
    {
      name: "muru-storefront",
      cwd: "/var/www/muru-storefront",
      script: "npm",
      args: "run start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Next.js читает NEXT_PUBLIC_* на сервере (RSC) в runtime — не только при build.
        NEXT_PUBLIC_API_BASE: "https://murushop.ru/api",
      },
    },
  ],
};
