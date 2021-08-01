const storageKey = "BOOKSHELF_APP";
const bookFormId = "input-new-book";
const inputSubmitBtnId = "input-submit";
const searchStringId = "search-string";
const uncompletedBooksId = "uncompleted-books";
const completedBooksId = "completed-books";

let books = [];

function isStorageExist() {
    return typeof(Storage) !== undefined;
}

function isBookFormFilled() {
    const bookTitle = document.getElementById("title-input").value;
    const bookAuthor = document.getElementById("author-input").value;
    const bookYear = document.getElementById("year-input").value;

    if (bookTitle !== "" && bookAuthor !== "" && bookYear !== "") {
            return true
    }
    return false
}

function isEditFormFilled() {
    const bookTitle = document.getElementById("title-edit").value;
    const bookAuthor = document.getElementById("author-edit").value;
    const bookYear = document.getElementById("year-edit").value;

    if (bookTitle !== "" && bookAuthor !== "" && bookYear !== "") {
            return true
    }
    return false
}

function loadDataFromStorage() {
    let data = JSON.parse(localStorage.getItem(storageKey));

    if (data !== null) {
        books = data;
    }
    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if (isStorageExist()) {
        localStorage.setItem(storageKey, JSON.stringify(books));
    }
}

function getSearchResults(searchString) {
    const filteredBooks = books.filter((book) => {
        return book.title.toLowerCase().includes(searchString);
    });
    renderSearchResults(filteredBooks);
}

function makeBookElement(title, author, year, isCompleted) {
    const icon = document.createElement("i");

    if (isCompleted) {
        icon.classList.add("fas","fa-book");
    } else {
        icon.classList.add("fas","fa-book-open");
    }

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon");
    iconContainer.append(icon);

    const bookTitle = document.createElement("h3");
    bookTitle.innerText = title;
    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = "Penulis: " + author;
    const bookYear = document.createElement("p");
    bookYear.innerText = "Tahun: " + year;

    const bookItemsContainer = document.createElement("div");
    bookItemsContainer.classList.add("item-content");
    bookItemsContainer.append(bookTitle, bookAuthor, bookYear);

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    if (isCompleted) {
        actionContainer.append(
            createUncompleteBtn(),
            createEditButton(),
            createTrashBtn()
            );
    } else {
        actionContainer.append(
            createCompleteBtn(),
            createEditButton(),
            createTrashBtn()
            );
    }

    const bookContainer = document.createElement("div");
    bookContainer.id = "book-items";
    bookContainer.classList.add("book-item");
    bookContainer.append(iconContainer, bookItemsContainer, actionContainer);

    return bookContainer;
}

function makeEditBookElement(bookId) {
    const theBook = findBook(bookId);

    const editH3 = document.createElement("h3");
    editH3.innerText = "Edit buku";
    
    const titleLabel = document.createElement("label");
    titleLabel.setAttribute("for","judul-baru");
    titleLabel.innerText = "Judul :";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.name = "judul-baru";
    titleInput.id = "title-edit";
    titleInput.value = theBook.title;
    titleInput.required = true;

    const authorLabel = document.createElement("label");
    authorLabel.setAttribute("for","penulis-baru");
    authorLabel.innerText = "Penulis :";

    const authorInput = document.createElement("input");
    authorInput.type = "text";
    authorInput.name = "penulis-baru";
    authorInput.id = "author-edit";
    authorInput.value = theBook.author;
    authorInput.required = true;

    const yearLabel = document.createElement("label");
    yearLabel.setAttribute("for","tahun-baru");
    yearLabel.innerText = "Tahun :";

    const yearInput = document.createElement("input");
    yearInput.type = "text";
    yearInput.name = "tahun-baru";
    yearInput.id = "year-edit";
    yearInput.value = theBook.year;
    yearInput.required = true;

    const editSubmitBtn = createButton("edit-submit", null, function(event) {
        editBookSubmit(event.target.parentElement, bookId);
    });
    editSubmitBtn.innerText = "Edit";

    const editCancelBtn = createButton("cancel-edit", null, function(event) {
        event.target.parentElement.remove();
    });
    editCancelBtn.innerText = "Batal";

    const editBookForm = document.createElement("form");
    editBookForm.id = "edit-form";
    editBookForm.append(
        editH3,
        titleLabel, titleInput,
        authorLabel, authorInput,
        yearLabel, yearInput,
        editSubmitBtn, editCancelBtn
    );

    return editBookForm;
}

function addBook() {
    const bookTitle = document.getElementById("title-input").value;
    const bookAuthor = document.getElementById("author-input").value;
    const bookYear = document.getElementById("year-input").value;
    const isBookCompleted = document.getElementById("is-completed").checked;
    
    const uncompletedBooks = document.getElementById(completedBooksId);
    const completedBooks = document.getElementById(completedBooksId);
    const bookElement = makeBookElement(bookTitle, bookAuthor, bookYear, isBookCompleted);
    
    const newBook = {
        id: +new Date(),
        title: bookTitle,
        author: bookAuthor,
        year: bookYear,
        isCompleted: isBookCompleted
    };
    bookElement["bookId"] = newBook.id;
    books.push(newBook);

    if (isBookFormFilled()) {
        if (isBookCompleted) {
            completedBooks.append(bookElement);
        } else {
            uncompletedBooks.append(bookElement);
        }
    }
    updateDataToStorage();
}

function createCompleteBtn() {
    return createButton("complete-btn", "fas fa-check", function(event) {
        moveBookToCompleted(event.target.parentElement, null);
    });
}

function createUncompleteBtn() {
    return createButton("uncomplete-btn", "fas fa-times", function(event) {
        moveBookToUncompleted(event.target.parentElement, null);
    });
}

function createEditButton() {
    return createButton("edit-btn", "fas fa-edit", function(event) {
        editBook(event.target.parentElement, null);
    });
}

function createTrashBtn() {
    return createButton("trash", "fas fa-trash", function(event) {
        removeBook(event.target.parentElement, null);
    });
}

function createButton(btnTypeClass, iconTypeClass, eventListener) {
    const button = document.createElement("button");
    button.classList.add(btnTypeClass);

    if (iconTypeClass !== null) {
        let iconClass = iconTypeClass.split(" ");
        const icon = document.createElement("i");
        icon.classList.add(iconClass[0], iconClass[1]);
        button.append(icon);
    }

    button.addEventListener("click", function(event) {
        eventListener(event);
    });

    return button;
}

function renderSearchResults(filteredBooks) {
    const uncompletedBooks = document.getElementById(uncompletedBooksId);
    const completedBooks = document.getElementById(completedBooksId);
    let filteredUncompletedBooks = [];
    let filteredCompletedBooks = [];

    for (book of filteredBooks) {
        if (book.isCompleted) {
            filteredCompletedBooks.push(book);
        }
        else {
            filteredUncompletedBooks.push(book);
        }
    }

    const uncompletedHtmlString = filteredUncompletedBooks.map((book) => {
        return `
        <div class="book-item">
            <div class="icon">
                <i class="fas fa-book-open"></i>
            </div>
            <div class="item-content">
                <h3>${book.title}</h3>
                <p>Penulis: ${book.author}</p>
                <p>Tahun: ${book.year}</p>
            </div>
            <div class="action">
                <button class="complete-btn" onclick="moveBookToCompleted(this.parentElement,${book.id});"><i class="fas fa-check"></i></button>
                <button class="edit-btn" onclick="editBook(this.parentElement,${book.id});"><i class="fas fa-edit"></i></button>
                <button class="trash" onclick="removeBook(this.parentElement,${book.id});"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `}).join("");
    const completedHtmlString = filteredCompletedBooks.map((book) => {
        return `
        <div class="book-item">
            <div class="icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="item-content">
                <h3>${book.title}</h3>
                <p>Penulis: ${book.author}</p>
                <p>Tahun: ${book.year}</p>
            </div>
            <div class="action">
                <button class="complete-btn" onclick="moveBookToUncompleted(this.parentElement,${book.id});"><i class="fas fa-check"></i></button>
                <button class="edit-btn" onclick="editBook(this.parentElement,${book.id});"><i class="fas fa-edit"></i></button>
                <button class="trash" onclick="removeBook(this.parentElement,${book.id});"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `}).join("");

    uncompletedBooks.innerHTML = uncompletedHtmlString;
    completedBooks.innerHTML = completedHtmlString;
}

function moveBookToCompleted(bookElement, bookId) {
    const completedList = document.getElementById(completedBooksId);
    const bookItems = bookElement.parentElement;

    const bookTitle = bookItems.querySelector(".book-item > .item-content > h3").innerText;
    const bookAuthor = bookItems.querySelectorAll(".book-item > .item-content > p")[0].innerText;
    const bookYear = bookItems.querySelectorAll(".book-item > .item-content > p")[1].innerText;

    const newBookElement = makeBookElement(bookTitle, bookAuthor, bookYear, true);
    if (bookId === null) {
        const theBook = findBook(bookItems["bookId"]);
        theBook.isCompleted = true;
        newBookElement["bookId"] = theBook.id;
    } else {
        const theBook = findBook(bookId);
        theBook.isCompleted = true;
        newBookElement["bookId"] = theBook.id;
    }

    completedList.append(newBookElement);
    bookItems.remove();

    updateDataToStorage();
}

function moveBookToUncompleted(bookElement, bookId) {
    const uncompletedList = document.getElementById(uncompletedBooksId);
    const bookItems = bookElement.parentElement;

    const bookTitle = bookItems.querySelector(".book-item > .item-content > h3").innerText;
    const bookAuthor = bookItems.querySelectorAll(".book-item > .item-content > p")[0].innerText;
    const bookYear = bookItems.querySelectorAll(".book-item > .item-content > p")[1].innerText;

    const newBookElement = makeBookElement(bookTitle, bookAuthor, bookYear, false);
    if (bookId === null) {
        const theBook = findBook(bookItems["bookId"]);
        theBook.isCompleted = false;
        newBookElement["bookId"] = theBook.id;
    } else {
        const theBook = findBook(bookId);
        theBook.isCompleted = false;
        newBookElement["bookId"] = theBook.id;
    }

    uncompletedList.append(newBookElement);
    bookItems.remove();

    updateDataToStorage();
}

function editBook(bookElement, bookId) {
    const bookItems = bookElement.parentElement;
    const editForm = document.getElementById("edit-form");

    if (editForm) {
        editForm.remove();
    } else {
        if (bookId === null) {
            const editBookElement = makeEditBookElement(bookItems["bookId"]);
            bookItems.append(editBookElement);
        } else {
            const editBookElement = makeEditBookElement(bookId);
            bookItems.append(editBookElement);
        }
    }
}

function editBookSubmit(bookElement, bookId) {
    if (isEditFormFilled()) {
        bookItems = bookElement.parentElement;
        
        newTitle = document.getElementById("title-edit").value;
        newAuthor = document.getElementById("author-edit").value;
        newYear = document.getElementById("year-edit").value;
    
        bookIndex = findBookIndex(bookItems["bookId"]);
        if (bookId !== bookItems["bookId"]) {
            bookIndex = findBookIndex(bookId);
        }
    
        books[bookIndex].title = newTitle;
        books[bookIndex].author = newAuthor;
        books[bookIndex].year = newYear;
    
        updateDataToStorage();
    }
}

function removeBook(bookElement, bookId) {
    const bookItems = bookElement.parentElement;
    const removeConfirm = confirm("Yakin menghapus buku?");
    
    if (removeConfirm) {
        if (bookId === null) {
            const bookIndex = findBookIndex(bookItems["bookId"]);
            books.splice(bookIndex, 1);
            bookItems.remove();
        } else {
            const bookIndex = findBookIndex(bookId);
            books.splice(bookIndex, 1);
            bookItems.remove();
        }
        updateDataToStorage();
    }
}

function findBook(bookId) {
    for (book of books) {
        if (book.id == bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0;
    for (book of books) {
        if (book.id == bookId) {
            return index;
        }
        index++;
    }
    return -1;
}

const bookSubmitBtn = document.getElementById(inputSubmitBtnId);
const searchBar = document.getElementById(searchStringId);

bookSubmitBtn.addEventListener("click", function() {
    if (isStorageExist()) {
        if (isBookFormFilled()) {
            addBook();
        }
    } else {
        alert("Browser ini tidak mendukung Local Storage")
    }
});

searchBar.addEventListener("keyup", function() {
    const searchStringValue = document.getElementById(searchStringId).value.toLowerCase();

    getSearchResults(searchStringValue);
});


document.addEventListener("ondataloaded", () => {
    let uncompletedBooks = document.getElementById(uncompletedBooksId);
    let completedBooks = document.getElementById(completedBooksId);
    
    for (book of books) {
        const newBookElement = makeBookElement(book.title, book.author, book.year, book.isCompleted);
        newBookElement["bookId"] = book.id;
        
        if (book.isCompleted) {
            completedBooks.append(newBookElement);
        } else {
            uncompletedBooks.append(newBookElement);
        }
    }
});

window.addEventListener("load", function() {
    loadDataFromStorage();
});