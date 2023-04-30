
let addLoggedInCells = (books,profiles) => {
  let cell5 = bookList.rows[0].insertCell(5);
  cell5.innerHTML = ""
  books.forEach((book, index) => {    
    let row = bookList.rows[index+1];
    let cell5 = row.insertCell(5);
    const button = document.createElement('button')
    button.innerText = "Add";

    let cell6 = row.insertCell(6);
    const scoreButton = document.createElement('button');
    scoreButton.innerText = "Score";
    let cell7 = row.insertCell(7);
    const scoreSelect = document.createElement('select');
    scoreSelect.id = `select_${book.id}`;
    for (var i = 1; i <= 10; i++) {
      var option = document.createElement("option");
      option.value = i;
      option.text = i;
      scoreSelect.appendChild(option);
    }

    const profile = profiles.find(profile => profile.bookId === book.id);
    console.log("--- addLoggedInCells");
    console.log(profile);
    if(profile){
      button.disabled = (profile.chosen);
      scoreButton.disabled = (profile.score > 0);
    } else {
      button.disabled = false;
      scoreButton.disabled = false;
    }
    button.addEventListener('click', async () => {
      if(profile){
        await updateProfile(profile.id, true, profile.score);
        profiles = profiles.map(profile => {
          if(profile.bookId === book.id){
            profile.chosen = true;
            return profile;
          } else {
            return profile;
          }
        });
      } else {
        const newId = await createProfile(book.id, true, 0);
        profiles = [...profiles, {id: newId, bookId: book.id, chosen: true, score: 0}]
      }      
      addProfile(book);
      button.disabled = true;
    });
    cell5.appendChild(button);

    scoreButton.addEventListener('click', async () => {
      const select = document.querySelector(`#select_${book.id}`);
      const score = parseInt(select.value,10);
      profiles = await setProfileScore(book.id, profiles, score);
      book.averageScore = (book.averageScore)?((book.numScores * book.averageScore) + score)/(book.numScores + 1):score;
      book.numScores = (book.numScores)?book.numScores + 1:1;
      await updateBookAverageScore(book.id, book.averageScore, book.numScores);
      const readingList = getMyReadingList(books, profiles);
      console.log("--- new reading list");
      console.log(readingList);
      renderProfile(readingList);
      renderPage();
    });
    cell6.appendChild(scoreButton);
    cell7.appendChild(scoreSelect);
  });
}


let addProfile = async (book) => {
  let row = myList.insertRow(myList.rows.length);
  let cell0 = row.insertCell(0);
  let cell1 = row.insertCell(1);
  let cell2 = row.insertCell(2);
  let cell3 = row.insertCell(3);
  let cell4 = row.insertCell(4);
  
  cell0.innerHTML = book.id;
  cell1.innerHTML = book.title;
  cell2.innerHTML = book.author;
  cell3.innerHTML = book.averageScore.toFixed(1); 
  cell4.innerHTML = `<img src="${book.coverUrl}"></img>`;  
}

let createProfile = async (bookId, chosen, score) => {
  let response = await axios.post("http://localhost:1337/api/profiles",{
      data: {
        user: sessionStorage.getItem("loginId"),
        book:  bookId,
        chosen: chosen,
        score: score
      }
  },
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  }  
  );
  if(response.status === 200){
    return response.data.data.id;
  } else {
    return undefined;
  }
}

let deleteRowsFromBookList = () => {  
  const rowCount = bookList.rows.length;
  for (var i = 1; i < rowCount; i++) {
    bookList.deleteRow(1);
  }
}

let deleteRowsFromMyList = () => {  
  const rowCount = myList.rows.length;
  for (var i = 1; i < rowCount; i++) {
    myList.deleteRow(1);
  }
}

let getBooks = async () => {
  let response = await axios.get("http://localhost:1337/api/books?populate=*");
  return response.data.data.map(book => {
    return ({
      id: book.id,
      author: book.attributes.author,
      title: book.attributes.title,
      averageScore: book.attributes.averageScore?book.attributes.averageScore:0,
      numScores: book.attributes.numScores,
      coverUrl: `http://localhost:1337${book.attributes.cover.data.attributes.url}`,
    });
  });
}

let getMe = async () => {
  let response = await axios.get("http://localhost:1337/api/users/me?populate=deep,3",
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    }
  }
  );
  return response.data;
}

let getMyReadingList = (books, profiles) => {
  const readingList = profiles.filter(profile => profile.chosen).map(profile => {
    const foundBook = books.find(book => book.id == profile.bookId);
    if(foundBook){
      return {
        id: foundBook.id,
        title: foundBook.title,
        author: foundBook.author,
        averageScore: foundBook.averageScore,
        coverUrl: foundBook.coverUrl
      };
    }
  });
  return readingList;
}


async function getProfiles(){
  let response = await axios.get(`http://localhost:1337/api/profiles?filters[user][id][$eq]=${sessionStorage.getItem("loginId")}&populate[0]=book`,
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }
  );
  const profiles = response.data.data;
  let result = profiles.map(profile => {
    let attr = profile.attributes;
    return {id: profile.id, bookId:attr.book.data.id, score:attr.score, chosen:attr.chosen}
  });
  return result;
}

let login = async () => {
  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: identifier.value,
    password: password.value,
  });
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  renderPage();
};

let logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("loginId");
  renderPage();
  removeLoggedInCells();
  deleteRowsFromMyList();
}

let register = async () => {
  let usernameReg = document.querySelector("#usernameReg");
  let passwordReg = document.querySelector("#passwordReg");
  let emailReg = document.querySelector("#emailReg");
  console.log(`${usernameReg.value} -- ${passwordReg.value} -- ${emailReg.value}`);
  let response = await axios.post("http://localhost:1337/api/auth/local/register", {
    username: usernameReg.value,
    password: passwordReg.value,
    email: emailReg.value
  });
  console.log(response);
  sessionStorage.setItem("token", response.data.jwt);
};

let renderBooks = (books) => {
  const sortField = localStorage.getItem("sortField");
  console.log(sortField);
  switch (sortField) {
    case 'author':
      console.log('Sort author');
      books = books.sort((a,b) => a.author.localeCompare(b.author))
      break;
    case 'title':
      console.log('Sort title');
      books = books.sort((a,b) => a.title.localeCompare(b.title))
      break;
    case 'averageScore':
        console.log('Sort average score');
        books = books.sort((a,b) => {
          if(a.averageScore > b.averageScore){
            return 1;
          } else if (a.averageScore < b.averageScore){
            return -1;
          } else {
            return 0;
          }});
        break;
    default:      
      console.log('Default sort on title');
      books = books.sort((a,b) => a.title.localeCompare(b.title))
  }

  deleteRowsFromBookList();

  books.forEach(async (book, index) => {
    let row = bookList.insertRow(index + 1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);
    let cell4 = row.insertCell(4);

    cell0.innerHTML = book.id;
    cell1.innerHTML = book.title;
    cell2.innerHTML = book.author;
    cell3.innerHTML = book.averageScore.toFixed(1);
    cell4.innerHTML = `<img src="${book.coverUrl}"></img>`;
  });
}

let renderPage = async () => {
  let books = await getBooks();
  renderBooks(books);
  if (sessionStorage.getItem("token")) {
    // Logged in
    signUpBtn.hidden = true;
    let me = await getMe();
    showUser.innerHTML = me.username;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    identifier.value = "";
    password.value = "";

    const profiles = await getProfiles();
    addLoggedInCells(books,profiles);
    const readingList = getMyReadingList(books, profiles);
    console.log(readingList);
    renderProfile(readingList);
    greeting.innerHTML = `<h2> Welcome! Logged in as <span id="showUser">${me.username}</span></h2> `;

  } else {
    // Logged out
    console.log("NOT authenticated");
    signUpBtn.hidden = false;
    showUser.innerHTML = "None";
    logoutBtn.style.display = "none";
    signUpBtn.disabled = false;
    loginBtn.style.display = "block";
    greeting.innerHTML = ``;
  }  
};


let renderProfile = (readingList) => {
  deleteRowsFromMyList();
  readingList.forEach((book, index) => {
    let row = myList.insertRow(index + 1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);
    let cell4 = row.insertCell(4);

    cell0.innerHTML = book.id;
    cell1.innerHTML = book.title;
    cell2.innerHTML = book.author;
    cell3.innerHTML = book.averageScore.toFixed(1);
    cell4.innerHTML = `<img src="${book.coverUrl}"></img>`; 
  });
}


let removeLoggedInCells = () => {
  for(let i = 0; i < bookList.rows.length; i++)
  {
    bookList.rows[i].deleteCell(5);
  }
}

let setProfileScore = async (bookId, profiles, score) => {
  const loginId = sessionStorage.getItem("loginId");
  console.log(`${bookId}:${loginId}`);
  let profile = profiles.find(profile => profile.bookId === bookId);
  console.log(profile);
  if(profile){
    await updateProfile(profile.id, profile.chosen, score);
    profiles = profiles.map(profile => {
      if(profile.bookId === bookId){
        return({id: profile.id, bookId: profile.bookId, chosen: profile.chosen, score: score})
      } else {
        return profile;
      }
    });
  } else {
    const newId = await createProfile(bookId, false, score);
    profiles = [...profiles, {id: newId, bookId: bookId, score:score, chosen:false}];    
  }
  return profiles;
}

let sort = async (field) => {
  localStorage.setItem("sortField", field);
  let books = await getBooks();
  renderBooks(books);
  if (sessionStorage.getItem("token")) {
    const profiles = await getProfiles();
    addLoggedInCells(books,profiles);  
  }
}

let updateBookAverageScore = async (bookId, averageScore, numScores) => {
  let response = await axios.put(`http://localhost:1337/api/books/${bookId}`,{
      data: {
        averageScore: averageScore,
        numScores: numScores
      }
  },
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  }  
  );
}

let updateProfile = async (id, chosen, score) => {
  let response = await axios.put(`http://localhost:1337/api/profiles/${id}`,{
      data: {
        chosen: chosen,
        score: score
      }
  },
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  }  
  );
  console.log(response);
}




let loginBtn = document.querySelector("#login");
loginBtn.addEventListener("click", login);
let logoutBtn = document.querySelector("#logout");
logoutBtn.addEventListener("click", logout);
let showUser = document.querySelector("#showUser");
let signUpBtn = document.querySelector("#signup");
let greeting = document.querySelector(".greeting-hidden");
signUpBtn.onclick = function(){
  modal.style.display = "block";
}
let identifier = document.querySelector("#identifier");
let password = document.querySelector("#password");
let bookList = document.querySelector("#bookList");
let modal = document.querySelector("#myModal");
let span = document.getElementsByClassName("close")[0];
span.onclick = function(){
  modal.style.display = "none";
}
let executeRegister = document.querySelector("#register");
executeRegister.addEventListener("click", register);
let myList = document.querySelector("#myList");

window.onclick = function(event){
  if (event.target == modal){
    modal.style.display = "none";
  }
}


renderPage();