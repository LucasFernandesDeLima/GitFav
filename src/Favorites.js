import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  save() {
    localStorage.setItem('@github-favorites', JSON.stringify(this.entries))
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites')) || []
  }

  delete(user) {
    const entriesFiltered = this.entries.filter(entry => {
      return entry.login !== user.login
    })

    this.entries = entriesFiltered
    this.update()
    this.save()
  }

  async add(userName) {
    try {
      const userExist = this.entries.find(
        entry => entry.login.toLowerCase() === userName
      )
      console.log(userExist)
      if (userExist) {
        throw new Error('Usuário já é um favorito!')
      }

      const user = await GithubUser.search(userName)
      if (user.login === undefined) {
        throw new Error('usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value.toLowerCase().replace(/\s/g, ''))
      this.root.querySelector('.search input').value = ''
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      const rowImplemented = this.addDataRow(row, user)
      this.tbody.append(rowImplemented)
    })
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td class="user">
        <img
          src="https://github.com/maykbrito.png"
          alt="Imagem de maykbrito"
        />
        <a href="https://github.com/maykbrito" target="_blank">
          <p class="username">Mayk Brito</p>
          <span>/maykbrito</span>
        </a>
      </td>
      <td class="repositories">50</td>
      <td class="followers">5000</td>
      <td class="action">
        <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  addDataRow(row, user) {
    row.querySelector('.user img').src = `https://github.com/${user.login}.png`
    row.querySelector('.user img').alt = `Imagem de ${user.name}`
    row.querySelector('.user a').href = `https://github.com/${user.login}`
    row.querySelector('.user p').textContent = `${user.name}`
    row.querySelector('.user span').textContent = `/${user.login}`

    row.querySelector('.repositories').textContent = `${user.public_repos}`
    row.querySelector('.followers').textContent = `${user.followers}`

    row.querySelector('.action .remove').onclick = () => {
      const isOK = confirm('Deseja deletar essa linha?')

      if (isOK) {
        this.delete(user)
      }
    }

    return row
  }
}
