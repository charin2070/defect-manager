class TeamView {
    constructor(teamData) {
      this.teamData = teamData;
    }
  
    show() {
      const teamCard = document.getElementById('teamCard');
      const teamName = document.getElementById('teamName');
      const teamDescription = document.getElementById('teamDescription');
      const teamMembers = document.getElementById('teamMembers');
      const closeButton = document.getElementById('closeButton');
  
      teamName.textContent = this.teamData.name;
      teamDescription.textContent = `${this.teamData.description}\nКоличество задач: ${this.teamData.openTasks}`;
      teamMembers.innerHTML = '';
      
      if (this.teamData.members && this.teamData.members.length > 0) {
        this.teamData.members.forEach(member => {
          const listItem = document.createElement('li');
          listItem.textContent = member;
          teamMembers.appendChild(listItem);
        });
      } else {
        teamMembers.innerHTML = '<li>Информация о составе команды недоступна</li>';
      }
  
      teamCard.style.display = 'block';
  
      closeButton.onclick = () => {
        teamCard.style.display = 'none';
        
        // Показываем график команд и скрываем backlog график
        const teamsChartCanvas = document.getElementById('teams-backlog-chart-canvas');
        const backlogChartCanvas = document.getElementById('backlog-chart-canvas');
        
        if (teamsChartCanvas && backlogChartCanvas) {
          teamsChartCanvas.style.visibility = 'visible';
          backlogChartCanvas.style.visibility = 'hidden';
        }
      };
    }
  
    hide() {
      const teamCard = document.getElementById('teamCard');
      teamCard.style.opacity = '0';
      setTimeout(() => {
        teamCard.style.display = 'none';
      }, 500); // Время анимации совпадает с CSS
    }
  }