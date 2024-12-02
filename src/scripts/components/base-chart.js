class BaseChart {
  constructor(data, canvasId) {
    this.data = data; // Issues array
    this.canvasId = canvasId;
  }

  // Метод для получения всех уникальных команд
  getUniqueTeams() {
    const teams = new Set();
    this.data.forEach(issue => {
      if (issue.team) {
        teams.add(issue.team);
      }
    });
    return Array.from(teams);
  }

  // Метод для проверки, завершена ли задача
  isResolved(taskStatus) {
    return taskStatus === "Закрыт" || taskStatus === "Отклонен";
  }
}
