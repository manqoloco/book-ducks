let loginBtn = document.querySelector("#login");
let logoutBtn = document.querySelector("#logout");
let showUser = document.querySelector("#showUser");
let signUpBtn = document.querySelector("#signup");
let identifier = document.querySelector("#identifier");
let password = document.querySelector("#password");
let bookList = document.querySelector("#bookList");
let bookImage = document.querySelector("#img")

let login = async () => {
  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: identifier.value,
    password: password.value,
  });
  console.log(response);
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  renderPage();
};

let logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("loginId");
  renderPage();
}

let getBooks = async () => {
  let response = await axios.get("http://localhost:1337/api/books?populate=*");
  return response.data.data;
}


let register = async () => {
  let response = await axios.post("http://localhost:1337/api/auth/local/register", {
    username: "nisse",
    password: "nisse123",
    email: "nisse@company.com"
  });
  console.log(response);
  sessionStorage.setItem("token", response.data.jwt);
  //renderPage();
};

let createProfile = async () => {
  let response = await axios.post("http://localhost:1337/api/profiles",{
      data: {
        bookId:  1,
        userId: sessionStorage.getItem("loginId"),
        grade: 7,
        chosen: false
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

async function getProfiles(){
  let response = await axios.get(`http://localhost:1337/api/profiles?filters[user][id][$eq]=${sessionStorage.getItem("loginId")}&populate[0]=book`,
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }
  );
  let result = response.data.data.map(profile => {
    let attr = profile.attributes;
    return {id:attr.book.data.id, grade:attr.grade, chosen:attr.chosen}
  });
  return result;
}

let renderPage = async () => {
  loginBtn.addEventListener("click", login);
  logoutBtn.addEventListener("click", logout);
  let books = await getBooks();
  console.log(books);

  if (sessionStorage.getItem("token")) {        
    signUpBtn.hidden = true;
    let profiles = await getProfiles();
    let me = await getMe();
    console.log(profiles);
    console.log(me);
    console.log("authenticated");
    showUser.innerHTML = me.username;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    identifier.value = "";
    password.value = "";
    // response.data.books.forEach((book) => {
    //   bookList.innerHTML += `<li>
    //   <h3>Name:${book.Title}</h3>
    //   <img src="http://localhost:1337${book.cover?.url}" height="100" />
    //   </li>`;
    // });
    // när man loggar ut kommer listan igen
 
}
   else {
    presentBooks(books);
    console.log("NOT authenticated");
    signUpBtn.hidden = false;
    showUser.innerHTML = "None";
    logoutBtn.style.display = "none";
    signUpBtn.disabled = false;
    loginBtn.style.display = "block";
  }
};

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

// for each book, img src localhost ${book.cover.url}
// "url":"/uploads/small_catcher_8a21e74a8a.jpg"

function presentBooks(books){
  books.forEach((book, index) => {
    let row = bookList.insertRow(index + 1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);
    let cell4 = row.insertCell(4);
    let cell5 = row.insertCell(5);
    cell0.innerHTML = book.id;
    cell1.innerHTML = book.attributes.Title;
    cell2.innerHTML = book.attributes.Author;
    cell3.innerHTML = book.attributes.Rating;
    cell4.innerHTML = `<img src="http://localhost:1337${book.attributes.cover.data.attributes.url}"></img>`;
    cell5.innerHTML = `<button class="addBtn">Add</button>` ;
  })
}




// add book function

let addBook = async () => {

  //1. Ladda upp bild
  let imgFile = bookImage.files;
  let formData = new FormData();
  formData.append("files", imgFile[0]);

  await axios
    .post("http://localhost:1337/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      //2. Skapa bok och koppla bilden samt användare till den.
      axios.post(
        "http://localhost:1337/api/books",
        {
          data: {
            name: bookName.value,
            user: sessionStorage.getItem("loginId"),
            image: response.data[0].id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    });
};

// adding to list

document.addEventListener("DOMContentLoaded", function () {

  var buttons = document.querySelectorAll(".addBtn");

  var list1 = document.getElementById("bookList");

  var list2 = document.getElementById("list2");

      function moveItem(e) {
      var newItem = document.createElement("li");

      if (this.parentElement.parentElement.id === "list1") {
          list2.appendChild(newItem);


      } else {
          list1.appendChild(newItem);

      }

      newItem.innerHTML = this.parentElement.innerHTML;
      this.parentElement.parentNode.removeChild(this.parentElement);

  }

  for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", moveItem);
  }

})

//document.querySelector("#addBook").addEventListener("click", addBook);
//loginBtn.addEventListener("click", login);
//registerBtn.addEventListener("click", register);

//createProfile();
renderPage();






// let identifier = document.querySelector("#identifier");
// let password = document.querySelector("#password");
// let loginBtn = document.querySelector("#login");
// let registerBtn = document.querySelector("#register");
// let bookList = document.querySelector("#bookList");
// let bookName = document.querySelector("#bookName");
// let bookImage = document.querySelector("#bookImage");

// let login = async () => {
//   let response = await axios.post("http://localhost:1337/api/auth/local", {
//     identifier: identifier.value,
//     password: password.value,
//   });
//   console.log(response);
//   sessionStorage.setItem("token", response.data.jwt);
//   sessionStorage.setItem("loginId", response.data.user.id);
//   //renderPage();
// };

// let register = async () => {
//   let response = await axios.post("http://localhost:1337/api/auth/local/register", {
//     username: "nisse",
//     email: "nisse@test.com",
//     password: "Test123",
//   });
//   console.log(response);
//   sessionStorage.setItem("token", response.data.jwt);

//   //renderPage();
// };

// let onPageLoad = async () => {
//   if (sessionStorage.getItem("token")) {
//     document.querySelector("#login").classList.add("hidden");
//     document.querySelector("#user").innerText = sessionStorage.getItem("user");
//     let response = await axios.get("http://localhost:1337/api/users/me?populate=deep,3", {
//       header: {
//         Authorization: `Bearer ${sessionStorage.getItem("token")}`
//       }
//     });
//     let data = await response.json();
//   console.log(data);
//   }
//   else {
//     console.log("no token");
//   }
  
// };

// let registerUser = async () => {
//   let response = await fetch("http://localhost:1337/api/auth/local/register", {
//     method: "POST",
//     body: JSON.stringify ({
//       identifier: "",
//       password: "",
//     }),
//   });


// }

// onPageLoad();


// let renderPage = async () => {
//   if (sessionStorage.getItem("token")) {
//     let response = await axios.get(
//       "http://localhost:1337/api/users/me?populate=deep,3",
//       {
//         headers: {
//           Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//         },
//       }
//     );
//     console.log(response.data);
//     response.data.books.forEach((book) => {
//       bookList.innerHTML += `<li>
//       <h3>Name:${book.Title}</h3>
//       <img src="http://localhost:1337${book.cover?.url}" height="100" />
//       </li>`;
//     });
//   }
// };

// let addBook = async () => {

//   //1. Ladda upp bild
//   let imgFile = bookImage.files;
//   let formData = new FormData();
//   formData.append("files", imgFile[0]);

//   await axios
//     .post("http://localhost:1337/api/upload", formData, {
//       headers: {
//         Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//       },
//     })
//     .then((response) => {
//       //2. Skapa bok och koppla bilden samt användare till den.
//       axios.post(
//         "http://localhost:1337/api/books",
//         {
//           data: {
//             name: bookName.value,
//             user: sessionStorage.getItem("loginId"),
//             image: response.data[0].id,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//           },
//         }
//       );
//     });
// };

// document.querySelector("#addBook").addEventListener("click", addBook);
// document.querySelector("#register").addEventListener("click", registerUser);
// document.querySelector("#login").addEventListener("click", login);
// // loginBtn.addEventListener("click", login);
// // registerBtn.addEventListener("click", register);

// //renderPage();

// // let todoList = document.querySelector("ul");
// // let completedList = document.querySelector("#completed-list");

// // let todoTitle = document.querySelector("#todoTitle");
// // let todoDesc = document.querySelector("#todoDesc");
// // //REGISTRATION
// // let username = document.querySelector("#username");
// // let email = document.querySelector("#email");
// // let registerPassword = document.querySelector("#registerPassword");

// // //LOGIN
// // let identifier = document.querySelector("#identifier");
// // let loginPassword = document.querySelector("#password");

// // let renderPage = async () => {
// //   if (sessionStorage.getItem("token")) {
// //     document.querySelector("#authentication-box").classList.add("hidden");
// //     document.querySelector("#todos-box").classList.remove("hidden");
// //     let response = await axios.get("http://localhost:1337/api/books", {
// //       headers: {
// //         Authorization: `Bearer ${sessionStorage.getItem("token")}`,
// //       },
// //     });
// //     console.log(response.data.data);
// //     if (response.data) {
// //       todoList.innerHTML = "";
// //       completedList.innerHTML = "";
// //       let todos = response.data.data.filter(
// //         (todo) => !todo.attributes.completed
// //       );
// //       let completedTodos = response.data.data.filter(
// //         (todo) => todo.attributes.completed
// //       );

// //       todos.forEach((todo) => {
// //         todoList.innerHTML += `<li>
// //           <b>Title</b>:${todo.attributes.title}
// //           <b>Description:</b> ${todo.attributes.description}
// //           <button onclick="completeTodo(${todo.id})">Complete</button>
// //           <button onclick="deleteTodo(${todo.id})">Delete</button>
// //           <button onclick="toggleEdit(this)">Edit</button>
// //           <div class="editForm hidden">
// //             <input type="text" placeholder="Title" value="${todo.attributes.title}"></input>
// //             <input type="text" placeholder="Description" value="${todo.attributes.description}"></input>
// //             <button onclick="editTodo(this, ${todo.id})">Confirm</button>
// //           </div>
// //         </li>`;
// //       });
// //       completedTodos.forEach((todo) => {
// //         completedList.innerHTML += `<li>
// //           <b>Title</b>:${todo.attributes.title}
// //           <b>Description:</b> ${todo.attributes.description}
// //           <button onclick="deleteTodo(${todo.id})">Delete</button>
// //         </li>`;
// //       });
// //     }
// //   }
// // };

// // let completeTodo = async (id) => {
// //   await axios.put(
// //     `http://localhost:1337/api/books/${id}`,
// //     {
// //       data: {
// //         completed: true,
// //       },
// //     },
// //     {
// //       headers: {
// //         Authorization: `Bearer ${sessionStorage.getItem("token")}`,
// //       },
// //     }
// //   );
// //   renderPage();
// // };

// // let toggleEdit = (e) => {
// //   let editForm = e.nextElementSibling;
// //   editForm.classList.remove("hidden");
// // };
// // let editTodo = async (element, id) => {
// //   let desc = element.previousElementSibling;
// //   let title = desc.previousElementSibling;
// //   console.log(title, desc);
// //   await axios.put(
// //     `http://localhost:1337/api/books/${id}`,
// //     {
// //       data: {
// //         title: title.value,
// //         description: desc.value,
// //       },
// //     },
// //     {
// //       headers: {
// //         Authorization: `Bearer ${sessionStorage.getItem("token")}`,
// //       },
// //     }
// //   );
// //   renderPage();
// // };

// // let deleteTodo = async (id) => {
// //   await axios.delete(`http://localhost:1337/api/books/${id}`, {
// //     headers: {
// //       Authorization: `Bearer ${sessionStorage.getItem("token")}`,
// //     },
// //   });
// //   renderPage();
// // };

// // let register = async () => {
// //   await axios.post("http://localhost:1337/api/auth/local/register", {
// //     username: username.value,
// //     email: email.value,
// //     password: registerPassword.value,
// //   });
// //   alert("User has been created! Please login :) ");
// // };

// // let login = async () => {
// //   let response = await axios.post("http://localhost:1337/api/auth/local", {
// //     identifier: identifier.value,
// //     password: loginPassword.value,
// //   });
// //   sessionStorage.setItem("token", response.data.jwt);
// //   renderPage();
// // };

// // let addTodo = async () => {
// //   await axios.post(
// //     "http://localhost:1337/api/books",
// //     {
// //       data: {
// //         title: todoTitle.value,
// //         description: todoDesc.value,
// //         completed: false,
// //       },
// //     },
// //     {
// //       headers: {
// //         Authorization: `Bearer ${sessionStorage.getItem("token")}`,
// //       },
// //     }
// //   );
// //   renderPage();
// // };

// // document.querySelector("#addTodo").addEventListener("click", addTodo);
// // document.querySelector("#register").addEventListener("click", register);
// // document.querySelector("#login").addEventListener("click", login);

// // renderPage();