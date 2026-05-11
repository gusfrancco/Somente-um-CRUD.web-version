

export const fetchDashboardData = async () => {
  return new Promise((resolve, reject) => {

    setTimeout(() => {
      // Simulação de verificação de token (opcional, mas boa prática no mock)
      const token = localStorage.getItem('authToken');
      if (!token) {
        reject(new Error("Usuário não autenticado. Redirecionando..."));
        return;
      }

      // Dados mockados focados em gestão de estoque
      resolve({
        kpis: {
          totalProducts: 145,
          lowStockAlerts: 12,
          outOfStock: 3,
          totalValue: "R$ 45.230,00"
        },
        recentActivity: [
          { id: 101, action: "Entrada", product: "Monitor B156HAN12.1", quantity: 50, date: "2026-04-14" },
          { id: 102, action: "Saída", product: "Teclado Mecânico", quantity: 5, date: "2026-04-13" },
          { id: 103, action: "Ajuste", product: "Mouse Sem Fio", quantity: -2, date: "2026-04-12" }
        ]
      });
    }, 1000);
  });
};