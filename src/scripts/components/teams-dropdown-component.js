<<<<<<< HEAD
// Teams dropdown component
class TeamsDropdownComponent extends CustomDropdown {
=======
class TeamsDropdownComponent extends DropdownComponent {
>>>>>>> 413ea59d99e7f4b83c6ec8cbf77e1de2e15d057b
    constructor(containerId, text = 'Все команды') {
        super(containerId, text);
        this.container.classList.add('dropdown'); // Добавляем класс dropdown для правильного отображения
    }

    updateTeams(teams) {
        this.clearMenu();
        
        // Добавляем опцию "Все команды"
        const allTeamsItem = this.createMenuItem('Все команды', () => {
            this.setButtonText('Все команды');
            document.dispatchEvent(new CustomEvent('teamSelected', {
                detail: { team: 'all' }
            }));
        });
        this.dropdownMenu.appendChild(allTeamsItem);

        if (teams && teams.length > 0) {
            this.addDivider();

            // Добавляем команды
            teams.forEach(team => {
                if (team) {  // Проверяем, что team не пустой
                    const teamItem = this.createMenuItem(team, () => {
                        this.setButtonText(team);
                        document.dispatchEvent(new CustomEvent('teamSelected', {
                            detail: { team: team }
                        }));
                    });
                    this.dropdownMenu.appendChild(teamItem);
                }
            });
        }
    }

    selectTeam(team) {
        if (team) {
            const teamText = team === 'all' ? 'Все команды' : team;
            this.setButtonText(teamText);
        }
    }

    getSelectedTeam() {
        return this.button.textContent === 'Все команды' ? 'all' : this.button.textContent;
    }
}
