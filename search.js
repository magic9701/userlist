const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const USER_PER_PAGE = 12
//for user render
const userList = []
const cardContainer = document.querySelector("#card-container");
//for favorite
const btnAddFavorite = document.querySelector(".btn-add-favorite")
const LocalData = JSON.parse(localStorage.getItem('favoriteUser')) || []
//for search
const searchSubmitButton =document.querySelector("#search-submit-button")
const searchName =document.querySelector("#search-name")
const searchMinAge =document.querySelector("#search-min-age")
const searchMaxAge =document.querySelector("#search-max-age")
const searchMale =document.querySelector("#search-male")
const searchFemale =document.querySelector("#search-female")
let filteredUser = []
//for paginator
const paginator = document.querySelector('#paginator')

axios.get(INDEX_URL).then(function(Response) {
  userList.push(...Response.data.results);
  renderPaginator(userList.length)
  renderCard(getUserByPage(1));
});

//搜尋監聽器
searchSubmitButton.addEventListener('click',function search(event){
  // 先確認輸入年紀是否在限制內，再開始搜尋
  const minAge = Number(searchMinAge.value)
  const maxAge = Number(searchMaxAge.value)
  checkAgeAndSearch(minAge, maxAge)
})

//Age限制為13歲-125歲 && 第一格數字不可大於第二格，有錯就跳alert，沒錯才執行搜尋
function checkAgeAndSearch(minAge,maxAge){
  if (minAge < 13 || maxAge < 13) {
    window.alert('最小年紀為13歲')
    return
  } else if (minAge > 125 || maxAge > 125) {
    window.alert('最大年紀為125歲')
    return
  } else if (minAge > maxAge) {
    window.alert('請先輸入最小年齡限制，再輸入最大年齡限制。\n您的最小年齡不可大於最大年齡！')
    return
  }
  //開始搜尋
  filterForGender(filterForAge(filterForName()))
  if(filteredUser.length === 0){
    window.alert("無符合條件的使用者，請修改條件再搜尋！")
  }else{
    renderPaginator(filteredUser.length)
    renderCard(getUserByPage(1))
  }
}

//過濾名字
function filterForName(){
  const name = searchName.value.trim().toLowerCase()
  let filteredName = []
  if(!name){
    filteredName = userList
  }else {
    filteredName = userList.filter(item => {
      const fullName = item.name + item.surname
      return fullName.trim().toLowerCase().includes(name)
    })
  }
  return filteredName
}

//過濾年齡
function filterForAge(data){
  ageFilteredWithMin = data.filter(item => {
    return item.age >= searchMinAge.value
  })
  ageFilteredWithBoth = ageFilteredWithMin.filter(item => {
    return item.age <= searchMaxAge.value
  })
  return ageFilteredWithBoth
}
//過濾性別
function filterForGender(data){
  if(searchMale.checked && !searchFemale.checked){
    onlyMale = data.filter(item => {
      return item.gender === "male"
    })
    filteredUser = onlyMale
  }else if (!searchMale.checked && searchFemale.checked){
    onlyFemale = data.filter(item => {
      return item.gender === "female"
    })
    filteredUser = onlyFemale
  }else{
    filteredUser = data
  }
}

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
      renderbtn(data.id)
    })
    .catch((error) => console.log(error));
}

//判斷modal按鈕顏色
function renderbtn(id){
  if(LocalData.some(user => user.id === id)){
    btnLike()
  }else {
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

function addToFavorite(id) {
  const user = userList.find(userList => userList.id === id)
  LocalData.push(user)
  localStorage.setItem('favoriteUser', JSON.stringify(LocalData))
}

//移除最愛
function removeFromFavorite(id) {
  const userIndex = LocalData.findIndex(user => user.id === id)
  LocalData.splice(userIndex, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(LocalData))
}

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
  if (LocalData.some(user => user.id === id)) {
    removeFromFavorite(id)
    btnDislike()
  } else {
    addToFavorite(id)
    btnLike()
  }
})

// 設定每頁顯示資料數
function getUserByPage(page){
  if(filteredUser.length !== 0){
    return filteredUser.slice((page - 1) * USER_PER_PAGE, page * USER_PER_PAGE)
  }else{
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