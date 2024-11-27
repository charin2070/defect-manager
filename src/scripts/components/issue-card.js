class IssueCard {
  constructor({ title, timeAgo, description, footer }) {
    this.title = title;
    this.timeAgo = timeAgo;
    this.description = description;
    this.footer = footer;
  }

  // Метод для создания HTML карточки
  createCard() {
    const card = document.createElement('a');
    card.classList.add('list-group-item', 'list-group-item-action');
    
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('d-flex', 'w-100', 'justify-content-between');

    const heading = document.createElement('h5');
    heading.classList.add('mb-1');
    heading.textContent = this.title;

    const time = document.createElement('small');
    time.classList.add('text-body-secondary');
    time.textContent = this.timeAgo;

    cardHeader.appendChild(heading);
    cardHeader.appendChild(time);

    const descriptionPara = document.createElement('p');
    descriptionPara.classList.add('mb-1');
    descriptionPara.textContent = this.description;

    const footerText = document.createElement('small');
    footerText.classList.add('text-body-secondary');
    footerText.textContent = this.footer;

    card.appendChild(cardHeader);
    card.appendChild(descriptionPara);
    card.appendChild(footerText);

    return card;
  }

  // Метод для добавления карточки в родительский элемент
  appendTo(parentElement) {
    const card = this.createCard();
    parentElement.appendChild(card);
  }
}
