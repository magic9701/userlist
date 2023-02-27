const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const USER_PER_PAGE = 12
//for user render
const userList = []
const cardContainer = document.querySelector("#card-container");
//for favorite
const btnAddFavorite = document.querySelector(".btn-add-favorite")
const userModal = document.querySelector('#user-modal')
//for paginator
const paginator = document.querySelector('#paginator')

axios.get(INDEX_URL).then(function(Response) {
  userList.push(...Response.data.results);
});

//渲染首頁使用者清單
function renderCard(data) {
  let htmlContent = "";

  data.forEach(function(user) {
    htmlContent += `
      <div class="col-12 col-md-4 col-lg-3 col-xxl-2 mb-2 p-1 ">
        <div class="card user-card border-2 rounded-3" style="width: 12rem">
            <img class="card-img-top " src="${user.avatar}" alt="Card image cap" data-id='${user.id}' data-bs-toggle="modal" data-bs-target="#user-modal">
        </div>
        <div class="user-info">
          <h5 class="card-text mt-2">${user.name} ${user.surname}</h6>
          <h6 class="card-text">${user.region}</h6>
        </div>
      </div>
    `;
    cardContainer.innerHTML = htmlContent;
  });
}


// 點擊圖片後，顯示使用者資訊
function showUserInfo(id) {
  const modalTitle = document.querySelector(".modal-title");
  const modalAvatar = document.querySelector(".modal-avatar");
  const modalUserInfo = document.querySelector(".modal-user-info");

  // 清空避免出現上一個 user 資料
  modalTitle.textContent = "";
  modalAvatar.src = "";
  modalUserInfo.textContent = "";

  axios
    .get(INDEX_URL + "/" + id)
    .then((response) => {
      const data = response.data;
      modalTitle.innerText = data.name + " " + data.surname;
      modalAvatar.src = data.avatar;
      btnAddFavorite.setAttribute("id", data.id)
      modalUserInfo.innerHTML = `
        <h6>gender: ${data.gender}</h6>
        <h6>region: ${data.region}</h6>
        <h6>age: ${data.age}</h6>
        <h6>birthday: ${data.birthday}</h6>
        <h6>email: ${data.email}</h6>  
      `;
      renderBtn(data.id)
    })
    .catch((error) => console.log(error));
}

//判斷modal按鈕顏色
function renderBtn(id) {
  if (localData.some(user => user.id === id)) {
    btnLike()
  } else {
    btnDislike()
  }
}

// 使用者圖片點擊監聽器
cardContainer.addEventListener("click", function(event) {
  if (event.target.matches(".card-img-top")) {
    showUserInfo(event.target.dataset.id)
  }
});


//加入最愛
const localData = JSON.parse(localStorage.getItem('favoriteUser')) || []

function addToFavorite(id) {
  const user = userList.find(userList => userList.id === id)
  localData.push(user)
  localStorage.setItem('favoriteUser', JSON.stringify(localData))
  renderCard(getUserByPage(1))
  renderPaginator(localData.length)
}

//移除最愛
function removeFromFavorite(id) {
  const userIndex = localData.findIndex(user => user.id === id)
  localData.splice(userIndex, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(localData))
  renderCard(getUserByPage(1))
  renderPaginator(localData.length)
}

//設置監聽器，關閉modal時，若已無最愛user，刷新頁面(不然最後一個userCard不會消失)
//加了分頁之後用不到了
// userModal.addEventListener('hidden.bs.modal', function (event) {
//   if (!localData || !localData.length) {
//     window.location.reload()
//   }
// })  

//按鈕變色
function btnLike() {
  btnAddFavorite.classList.remove('btn-secondary')
  btnAddFavorite.classList.add('btn-danger')
}

function btnDislike() {
  btnAddFavorite.classList.remove('btn-danger')
  btnAddFavorite.classList.add('btn-secondary')
}

//加入最愛按鈕監聽器
btnAddFavorite.addEventListener('click', function(event) {
  const id = Number(event.currentTarget.id)
  //加入或移除最愛、按鈕變色
  if (localData.some(user => user.id === id)) {
    removeFromFavorite(id)
    btnDislike()
  } else {
    addToFavorite(id)
    btnLike()
  }
})

// 設定每頁顯示資料數
function getUserByPage(page){
  if(localData.length !== 0){
    return localData.slice((page - 1) * USER_PER_PAGE, page * USER_PER_PAGE)
  }else if(localData.length === 0){
    window.location.reload()
  }else {
   return userList.slice((page - 1) * USER_PER_PAGE, page * USER_PER_PAGE) 
  }
}

//render paginator
function renderPaginator(userAmount){
  const numberOfPage = Math.ceil(userAmount / 12)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++){
    rawHTML += `<li class="page-item" id="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
    paginator.innerHTML = rawHTML
  }
  paginator.firstElementChild.classList.add('active')
}

// listen to paginator
paginator.addEventListener('click', function (event) {
  if (event.target.tagName !== 'A') {
    return
  }else{
    const activeItem = document.querySelector('#page-item.active')
    if (activeItem) {
      activeItem.classList.remove('active')
      event.target.parentElement.classList.add('active')
    }
    const page = Number(event.target.dataset.page)
    renderCard(getUserByPage(page))
  }
})

//render favorite user & paginator
renderPaginator(localData.length)
renderCard(getUserByPage(1));