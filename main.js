'use strict';

const STORE = {
  items: [
    { id: cuid(), name: 'apples', checked: false },
    { id: cuid(), name: 'oranges', checked: false },
    { id: cuid(), name: 'milk', checked: true },
    { id: cuid(), name: 'bread', checked: false }
  ],
  hideCompleted: false,
  filtered: false,
  editing: null
};

// ------------ display

function generateItemElement(item) {

  // check if STORE.editing === item.id in ``, disable edit button also

  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? 'shopping-item__checked' : ''}">
      ${STORE.editing === item.id ?
      `<form>
        <input type="text" name="edit-name" class="js-edit-search" value="${item.name}">
        </form>`
      : item.name}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <button class="shopping-item-edit js-edit-item">
          <span class="button-label">edit</span>
        </button>
      </div>
    </li>`;
}


function generateShoppingItemsString(shoppingList) {
  //console.log('Generating shopping list element');

  const items = shoppingList.map((item) => generateItemElement(item));

  return items.join('');
}


function renderShoppingList(searchTerm) {
  // render the shopping list in the DOM
  //console.log('`renderShoppingList` ran');

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;

  if (STORE.filtered) {
    //console.log('filtered');
    filteredItems = filteredItems.filter((item) => {
      if (item.name.startsWith(searchTerm)) {
        return item;
      }
    });
  }

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}

// ------------------- logic

function addItemToShoppingList(itemName) {
  //console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({ name: itemName, checked: false });
}

function toggleCheckedForListItem(itemId) {
  //console.log('Toggling checked property for item with id ' + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}


function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  //console.log(`Deleting item with id  ${itemId} from shopping list`);

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

function toggleSearchTerm() {
  STORE.filtered = !STORE.filtered;
}

function toggleEditItem(itemId) {
  // const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.editing = itemId;

}

// ------------------ listener's

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function (event) {
    event.preventDefault();
    //console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    //console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}

function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

function handleSearchClicked() {
  $('#js-search-term-form').submit((e) => {
    e.preventDefault();
    const searchTerm = $('.js-search-term').val();
    //console.log('Search term: ' + searchTerm);
    toggleSearchTerm();
    renderShoppingList(searchTerm);
  });
}

function handleClearSearchClicked() {
  $('#search-form-clear').click(() => {
    $('.js-search-term').val('');
    toggleSearchTerm();
    renderShoppingList();
  });
}

function handleEditClicked() {
  $('.js-shopping-list').on('click', '.js-edit-item', (e) => {
    //console.log('`handleEditClicked` ran');
    console.log(e.currentTarget.closest('li'));
    const id = getItemIdFromElement(e.currentTarget);
    toggleEditItem(id);
    renderShoppingList();
    // let itemHtml = $(e.currentTarget).closest('li').find('.js-shopping-item');
    // console.log(parent.text());
  });
}

function handleEditPressEnter(){
  $('.js-shopping-list').on('keypress', (e) =>{
    console.log('pressed: ', e.keyCode);
    if (e.keyCode === '13'){
      e.preventDefault();
      const editedName = $('.js-edit-search').val();
      console.log(editedName);
    }
  });
  STORE.editing = null;
  renderShoppingList();
}


// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleSearchClicked();
  handleClearSearchClicked();
  handleEditClicked();
  handleEditPressEnter();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);
