let todo = new Vue({
    el: "#todo",
    data: {
        isAddingNewNoteBook: false,
        noteBooks: [],
        newNoteBookName: "",
        toDelete: [],
    },
    watch: {
        noteBooks: function() {
            localStorage.noteBooks = JSON.stringify(this.noteBooks);
        },
        toDelete: function() {
            localStorage.toDelete = JSON.stringify(this.toDelete);
        }
    },
    mounted() {
        noteBooks = JSON.parse(localStorage.noteBooks);
        try {
            toDelete = JSON.parse(localStorage.toDelete);
        } catch(e) {
            toDelete = null;
        }

        if(noteBooks) this.noteBooks = noteBooks;
        if(toDelete) this.toDelete = toDelete;

        this.reload();
    },
    methods: {
        showCreationForm: function() {
            // Отображает форму для ввода названия нового блокнота
            if (this.isAddingNewNoteBook == true) {
                this.isAddingNewNoteBook = false;
            } else {
                this.isAddingNewNoteBook = true;
            }
        },
        submitNewNotebook: function() {
            // Добавляет новый блокнот
            if (this.newNoteBookName === "") return null;

            let timeStamp = this.getCurrentTimeStamp();

            let newNoteBook = {
                id: todo.noteBooks.length,
                name: this.newNoteBookName,
                notes: [],
                timeStamp: timeStamp,
            };

            this.noteBooks.push(newNoteBook);
            
            this.newNoteBookName = "";
            this.isAddingNewNoteBook = false;
        },
        deleteSelectedNotes: function() {
            // Удаляет выделенные чекбоксами задачи
            if (this.toDelete.length === 0) return null;

            for (let noteToDelete of this.toDelete) {

                for(let noteBook of this.noteBooks) {

                    for(let note of noteBook.notes) {

                        if(JSON.stringify(note) === JSON.stringify(noteToDelete)) {
                            let noteIndex = noteBook.notes.indexOf(note);
                            let noteToDeleteIndex = this.toDelete.indexOf(noteToDelete);

                            this.toDelete.splice(noteToDeleteIndex, 1);
                            noteBook.notes.splice(noteIndex, 1);
                            console.log("Deleted");

                            this.deleteSelectedNotes();
                        }

                    }

                }

            }
            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
            this.reload();
        },
        preventNoteFromDeletion: function(note) {
            // Предотвращает удаление задач, которые не выделены чекбоксами
            for(let noteBook of this.noteBooks) {
                for(let myNote of noteBook.notes) {
                    if (JSON.stringify(note) === JSON.stringify(myNote)) {
                        let indexOfCurrentNoteBook = this.noteBooks.indexOf(noteBook);
                        let indexOfCurrentNote = this.noteBooks[indexOfCurrentNoteBook].notes.indexOf(myNote);

                        this.noteBooks[indexOfCurrentNoteBook].notes[indexOfCurrentNote].checked = false;
                        this.toDelete.splice(this.toDelete.indexOf(note), 1);
                    }
                }
            }
            localStorage.toDelete = JSON.stringify(this.toDelete);
            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
            this.reload();
        },
        getCurrentTimeStamp: function() {
            let timeStamp = {};

            let today = new Date();
            let date = (today.getDay() + 6) + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

            timeStamp.date = date;
            timeStamp.time = time;
            timeStamp.dateTime = date + " " + time;

            return timeStamp;
        },
        reload: function() {
            // Обновляет страницу, чтобы исправить баг, делающий чекбоксы ошибочно чекнутыми из за удаления
            setTimeout(function() {
                allNotes = document.getElementsByClassName('note');

                for(let noteBook of this.noteBooks) {
                    for(let note of noteBook.notes) {
                        for(let node of allNotes) {
                            if(note.htmlId === node.id) {

                                let inputCheckBox = node.lastChild.firstChild.firstChild;
                                inputCheckBox.checked = note.checked;
                            }
                        }
                    }
                }
            }, 1)
        }
    }
});

Vue.component("note-book", {
    props: ['noteBook'],
    data: function() {
        return {
            isAddingNewNote: false,
            isEditting: false,
            newNoteName: "",
            edittedNoteBookName: "",
        }
    },
    methods: {
        showCreationNoteForm: function() {
            // Отображает форму для ввода названия новой задачи
            if(this.isAddingNewNote == false) {
                this.isAddingNewNote = true;
            } else {
                this.isAddingNewNote = false;
            }
        },
        submitNewNote: function(noteBook) {
            // Добавляет новую задачу в блокнот
            if (this.newNoteName === "") return null;

            let indexOfPassedNoteBook = todo.noteBooks.map(e => e.id).indexOf(noteBook["id"]);
            let currentNoteBook = todo.noteBooks[indexOfPassedNoteBook];
            let timeStamp = todo.getCurrentTimeStamp();

            let newNote = {
                id: currentNoteBook["notes"].length,
                name: this.newNoteName,
                htmlId: "note-" + this.newNoteName + "-" + currentNoteBook["notes"].length,
                parentNoteBookId: currentNoteBook.id,
                nodeTreeId: "note-" + this.newNoteName + "-" + currentNoteBook["notes"].length,
                timeStamp: timeStamp,
                checked: false,
            };

            currentNoteBook["notes"].push(newNote);
            this.newNoteName = "";
            this.isAddingNewNote = false;

            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
        },
        deleteNoteBook: function(noteBook) {
            // Удаляет блокнот. Также удаляет из списка toDelete все заметки удалённого блокнота
            indexOfNoteBook = todo.noteBooks.indexOf(noteBook);
            todo.noteBooks.splice(indexOfNoteBook, 1);

            for(let note of noteBook.notes) {
                for(let noteToDelete of todo.toDelete) {
                    if(JSON.stringify(note) === JSON.stringify(noteToDelete)) {
                        todo.toDelete.splice(todo.toDelete.indexOf(noteToDelete), 1);
                    }
                }
            }

            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
            localStorage.toDelete = JSON.stringify(todo.toDelete);
        },
        editNoteBook: function() {
            if(this.isEditting == true) {
                this.isEditting = false;
            } else {
                this.isEditting = true;
            }
        },
        submitEditting: function(noteBook) {
            // Изменяет имя блокнота на введённое
            let currentNoteBook = noteBook;
            for(let noteBook of todo.noteBooks) {
                if(noteBook.id === currentNoteBook.id) {
                    todo.noteBooks[todo.noteBooks.indexOf(noteBook)].name = this.edittedNoteBookName;
                    this.isEditting = false;
                    this.edittedNoteBookName = "";
                }
            }
            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
        }
    },
    
    template: `
                <div class="note-book">
                <p>{{ noteBook.timeStamp.dateTime }}</p> <br>

                    <div class="note-book-header">
                        <div>
                            <a href="#" v-on:click="showCreationNoteForm">
                                <img src="assets/img/note_book.png" alt="Добавить задачу">
                            </a> 

                            <template>
                                <template v-if="!isEditting">
                                <div>
                                    <p>{{ noteBook.name }}</p>
                                </div>
                                </template>

                                <template v-else>
                                    <fieldset>
                                        <input type="text" v-model="edittedNoteBookName" v-bind:placeholder="noteBook.name">
                                        <button v-on:click="submitEditting(noteBook)">Сохранить</button>
                                    </fieldset>
                                </temlpate>
                            </template>

                            <template>
                                <fieldset v-if="isAddingNewNote">
                                    <input type="text" placeholder="Введите название задачи" v-model="newNoteName">
                                    <button v-on:click="submitNewNote(noteBook)">Добавить</button>
                                </fieldset>
                                
                                <template v-else></template>
                            </template>
                            
                        </div>
                        <div class="links">
                            <a href="#" v-on:click="deleteNoteBook(noteBook)">
                                <img src="assets/img/delete.png" alt="Удалить блокнот">
                            </a>
                            <a href="#" v-on:click="editNoteBook">
                                <img src="assets/img/edit.png" alt="Редактировать блокнот">
                            </a>
                        </div>
                    </div>
                                      
                    <note
                    v-bind:noteBook="noteBook"
                    v-for="note in noteBook['notes']"
                    v-bind:note="note"
                    v-bind:key="note.parentNoteBookId"
                    v-bind:id="'note-'+note.name+'-'+note.id"
                    ></note>
                </div>
              `
});

Vue.component("note", {
    props: ['note', 'noteBook'],
    data: function() {
        return {
            isChecked: false,
            isEditting: false,
            edittedNoteName: "",
        }
    },
    methods: {
        addNoteToDeleteList: function(note, event) {
            // Добавляет задачу в список для удаления, если чекбокс был нажат
            if (note.checked) {
                todo.preventNoteFromDeletion(note);

                this.isChecked = false;
                event.target.checked = this.isChecked;
                
                console.log("prevented")
                todo.reload();
                return null
            }
            
            this.isChecked = true;

            for(let myNoteBook of todo.noteBooks) {
                for(let myNote of myNoteBook.notes) {
                    if(note.name === myNote.name && note.id === myNote.id && note.parentNoteBookId === myNote.parentNoteBookId) {
                        let indexOfNoteBook = todo.noteBooks.indexOf(myNoteBook);
                        let indexOfNote = todo.noteBooks[indexOfNoteBook].notes.indexOf(myNote);
                        todo.noteBooks[indexOfNoteBook].notes[indexOfNote].checked = this.isChecked;
                    }
                }
            }

            event.target.checked = this.isChecked;
            note.checked = this.isChecked;

            todo.toDelete.push(note);
            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
            todo.reload();
            console.log("added to delete list");
        },
        editNote: function() {
            if (this.isEditting) {
                this.isEditting = false;
            } else {
                this.isEditting = true;
            }
        },
        submitEditting: function(note) {
            // Изменяет имя задачи в блокноте на введённое
            let currentNote = note;
            for(let noteBook of todo.noteBooks) {
                if(noteBook.id === note.parentNoteBookId) {
                    for(let note of noteBook.notes) {
                        if (currentNote.id == note.id && currentNote.name == note.name && currentNote.parentNoteBookId == note.parentNoteBookId) {
                            let currentNoteBookIndex = todo.noteBooks.indexOf(noteBook);
                            let currentNoteIndex = todo.noteBooks[currentNoteBookIndex].notes.indexOf(note);

                            todo.noteBooks[currentNoteBookIndex].notes[currentNoteIndex].name = this.edittedNoteName;
                            todo.noteBooks[currentNoteBookIndex].notes[currentNoteIndex].htmlId = "note-" + this.edittedNoteName + "-" + todo.noteBooks[currentNoteBookIndex].notes[currentNoteIndex].id;

                            this.isEditting = false;
                            this.edittedNoteName = "";
                            localStorage.noteBooks = JSON.stringify(todo.noteBooks);
                            todo.reload();
                        }
                    }
                }
            }

        }
    },
    template: `
                <div class="note">
                    <div class="note-header">
                        <p>{{ note.timeStamp.dateTime }}</p> <br>
                    </div>
                    <div class="note-content-wrapper">
                        <div class="note-content">
                            <input type="checkbox" v-on:click="addNoteToDeleteList(note, $event)">
                            <label v-if="!isEditting">{{ note.name }}</label>

                            <template v-else>
                            <fieldset>
                                <input type="text" v-model="edittedNoteName" v-bind:placeholder="note.name">
                                <button v-on:click="submitEditting(note)">Сохранить</button>
                            </fieldset>
                        </temlpate>
                        </div>
                        <a href="#" v-on:click="editNote"><img src="assets/img/edit.png"></a>
                    </div>
                </div>
              `
});

