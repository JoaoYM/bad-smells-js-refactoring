export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    // 1. Filtragem de dados isolada
    const filteredItems = this.filterItems(user, items);
    
    // 2. Cálculo do total isolado (elimina a duplicação do total +=)
    const total = filteredItems.reduce((sum, item) => sum + item.value, 0);

    // 3. Formatação delegada para métodos específicos (Extract Method)
    if (reportType === 'CSV') {
      return this.generateCsv(user, filteredItems, total);
    } 
    
    if (reportType === 'HTML') {
      return this.generateHtml(user, filteredItems, total);
    }

    return '';
  }

  filterItems(user, items) {
    const ADMIN_PRIORITY_THRESHOLD = 1000;
    const USER_MAX_VALUE = 500;

    return items.filter(item => {
      if (user.role === 'ADMIN') {
        if (item.value > ADMIN_PRIORITY_THRESHOLD) {
          item.priority = true;
        }
        return true; // Admin vê tudo
      } 
      
      if (user.role === 'USER') {
        return item.value <= USER_MAX_VALUE; // User comum tem limite
      }
      
      return false;
    });
  }

  generateCsv(user, items, total) {
    let report = 'ID,NOME,VALOR,USUARIO\n';
    
    for (const item of items) {
      report += `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    
    report += '\nTotal,,\n';
    report += `${total},,\n`;
    
    return report.trim();
  }

  generateHtml(user, items, total) {
    let report = '<html><body>\n';
    report += '<h1>Relatório</h1>\n';
    report += `<h2>Usuário: ${user.name}</h2>\n`;
    report += '<table>\n';
    report += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';

    for (const item of items) {
      const styleAttr = item.priority ? ' style="font-weight:bold;"' : '';
      report += `<tr${styleAttr}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }

    report += '</table>\n';
    report += `<h3>Total: ${total}</h3>\n`;
    report += '</body></html>\n';
    
    return report.trim();
  }
}