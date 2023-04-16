let identifier = document.querySelector("#identifier");
let password = document.querySelector("#password");
let loginBtn = document.querySelector("#login");
let bookList = document.querySelector("#bookList");
let bookName = document.querySelector("#bookName");
let bookImage = document.querySelector("#bookImage");

let login = async () => {
  let response = await axios.post("http://localhost:1337/api/auth/local", {
    identifier: identifier.value,
    password: password.value,
  });
  console.log(response);
  sessionStorage.setItem("token", response.data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  //renderPage();
};

let renderPage = async () => {
  if (sessionStorage.getItem("token")) {
    let response = await axios.get(
      "http://localhost:1337/api/users/me?populate=deep,3",
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    console.log(response.data);
    response.data.books.forEach((book) => {
      bookList.innerHTML += `<li>
      <h3>Name:${book.Title}</h3>
      <img src="http://localhost:1337${book.cover?.url}" height="100" />
      </li>`;
    });
  }
};

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

document.querySelector("#addBook").addEventListener("click", addBook);
loginBtn.addEventListener("click", login);

//renderPage();