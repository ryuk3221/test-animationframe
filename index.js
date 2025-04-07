if (!window.localStorage.getItem('records')) {
  window.localStorage.setItem('records', JSON.stringify([]));
}

//Окно паузы
const pausePopup = document.querySelector('.pause-popup');
//Состояние паузы
let isPaused = false;
const notesContainer = document.querySelector('.notes-container');
//Игровые клавиши
const buttons = document.querySelectorAll('.buttons button');
//HTML элемент отрбражающий общее кол-во очков
const pointsHtml = document.querySelector('.points');
//кол-во оков за 1 попадание
const points = 10;
let totalPoints = 0;
let combo = 0;
//кол-во попаданий
let successHit = 0;
//кол-во промахов
let missHit = 0;
//HTML элемент отображающий рекорды карты
const records = document.querySelector('.records');
//для хранения id запланированных таймеров
const timersIds = [];

const FPS = 60;



function createNote(key) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.classList.add(`note${key}`)
  note.style.left = `${80 * key - 80}px`;
  note.style.top = '0px';
  notesContainer.appendChild(note);
  note.dataset.notecolumn = key;
  console.log('начало: ' + Date.now());


  let lastTime = 0;

  requestAnimationFrame(function animate(timeStamp) {
    if (timeStamp - lastTime >= 1000 / FPS) {
      const currentTop = parseFloat(note.style.top);

      if (!isPaused) {
        note.style.top = `${currentTop + 12}px`;
      }

      // Если нота достигла низа, удаляем её
      if (currentTop > 760) {
        console.log('конец: ' + Date.now());
        notesContainer.removeChild(note);
        combo = 0;
        comboHtml.innerHTML = combo;
        missHit++;
      }

      lastTime = timeStamp;
    }

    requestAnimationFrame(animate);
  });
};


const startBtn = document.querySelector('.btn-start');
const music = document.querySelector('.music');
music.volume = 0.1;


let currentMap;

//Старт игрового процесса (рендеринг нот)
startBtn.addEventListener('click', () => {
  createNote(2);
  music.play();
  // setTimeout(() => {
  //   music.play();
  // }, 1249);

  // currentMap.notes.forEach(note => {
  //   scheduleOfTimers(note.delay, () => {
  //     createNote(note.column);
  //     pop.currentTime = 0;
  //     pop.play();
  //     // setTimeout(() => {
  //     //   document.querySelector(`[data-key="${note.column}"]`).classList.add('active');
  //     //   pop.currentTime = 0;
  //     //   pop.play();
  //     //   setTimeout(() => {
  //     //     document.querySelector(`[data-key="${note.column}"]`).classList.remove('active');
  //     //   }, 40);
  //     // }, 1249);
  //   });
  // });

  //функция которая вызывается по окончанию карты
  scheduleOfTimers(currentMap.endTiming, () => {
    menu.classList.remove('menu--hide');
    game.classList.remove('game--open');
    music.volume = 0.2;


    const record = {
      id: currentMap.id,
      name: currentMap.name,
      img: currentMap.img,
      score: {
        success: successHit,
        missHit: missHit,
        points: totalPoints
      }
    }

    const currentRecords = JSON.parse(window.localStorage.getItem('records'));
    currentRecords.push(record);
    window.localStorage.setItem('records', JSON.stringify(currentRecords));
    console.log(JSON.parse(window.localStorage.getItem('records')));

    combo = 0;
    totalPoints = 0;
    successHit = 0;
    missHit = 0;


    pointsHtml.innerHTML = 0;
    comboHtml.innerHTML = 0;

    renderRecords(currentMap.id);

    currentMap = null;
    menu.classList.remove('menu--hide');
    game.classList.remove('game--open');
    records.classList.add('records--show');
  });

  //Обработчик паузы 
  window.addEventListener('keydown', event => {
    if (event.code == 'Escape') {
      isPaused = !isPaused;
      if (isPaused) {
        pausePopup.classList.add('pause-popup-active');
        music.pause();
        //Отчищаю запланированный рендеринг нот
        clearAllTimeouts();
      } else {
        pausePopup.classList.remove('pause-popup-active');
        //извлекаю текещий тайм трека, и перевожу ровно в мс
        const time = parseFloat(music.currentTime.toFixed(3)) * 1000;
        //Отфильтровал и отредактикоровал тайминги запланированных нот
        let newNotes = currentMap.notes.filter(note => note.delay - 1442 > time).map(note => ({ delay: note.delay - time - 1442, column: note.column }));
        console.log(newNotes);
        newNotes.forEach(note => {
          scheduleOfTimers(note.delay, () => {
            createNote(note.column);
          });
        });
        music.play();
      }
      console.log('PAUSE');
    }
  });
});

//Здесь будет код начала прсомотра автоплея

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.key;
    checkNoteHit(key);
  });
});

const comboHtml = document.querySelector('.timer');

function checkNoteHit(key) {

  const notes = notesContainer.querySelectorAll(`[data-notecolumn="${key}"`);
  const currentNote = notes[0];

  if (parseInt(currentNote.style.top) > 400) {

    if (parseInt(currentNote.style.top) > 700 && parseInt(currentNote.style.top) < 800) {
      //попадание
      combo += 1;
      totalPoints += points * combo;
      successHit++;
      comboHtml.innerHTML = combo;
      pointsHtml.innerHTML = totalPoints;
      currentNote.remove();
    } else {
      missHit++;
      combo = 0;
      comboHtml.innerHTML = combo;
      currentNote.remove();
    }
  }

}

const pop = document.querySelector('.audio1');
pop.volume = 0.25;


window.onkeydown = event => {
  if (event.code == 'KeyS') {
    pop.currentTime = 0;
    pop.play();
    document.querySelector('[data-key="1"]').classList.add('active')
    checkNoteHit(1);

  }

  if (event.code == 'KeyD') {
    pop.currentTime = 0;
    pop.play();
    document.querySelector('[data-key="2"]').classList.add('active')
    checkNoteHit(2);
  }

  if (event.code == 'KeyF') {
    pop.currentTime = 0;
    pop.play();
    document.querySelector('[data-key="3"]').classList.add('active')
    checkNoteHit(3);
  }

  if (event.code == 'KeyJ') {
    pop.currentTime = 0;
    pop.play();
    document.querySelector('[data-key="4"]').classList.add('active')
    checkNoteHit(4);
  }

  if (event.code == 'KeyK') {
    pop.currentTime = 0;
    pop.play();
    document.querySelector('[data-key="5"]').classList.add('active')
    checkNoteHit(5);
  }

  if (event.code == 'KeyL') {
    pop.currentTime = 0;
    pop.play();

    document.querySelector('[data-key="6"]').classList.add('active')
    checkNoteHit(6);
  }
};

window.onkeyup = () => {
  document.querySelector('.active').classList.remove('active')
}

const game = document.querySelector('.game');
const menu = document.querySelector('.menu');
let choosedMap = false;
const gameImg = document.querySelector('.game--img');

window.addEventListener('click', (event) => {
  if (event.target.closest('.menu__item')) {
    const mapId = event.target.closest('.menu__item').dataset.map;
    currentMap = maps.find(map => map.id === mapId)
    gameImg.style.backgroundImage = `url(${currentMap.img})`;
    music.setAttribute('src', `${currentMap.music}`);
    if (document.querySelector('.menu__item--seclected')) {
      document.querySelector('.menu__item--seclected').classList.remove('menu__item--seclected');
    }

    event.target.closest('.menu__item').classList.add('menu__item--seclected')

    document.querySelector('.menu__btn').classList.add('menu__btn--show');

    records.classList.add('records--show');

    renderRecords(currentMap.id);
  }

  if (event.target.closest('.menu__btn')) {
    menu.classList.add('menu--hide');
    game.classList.add('game--open');
    records.classList.remove('records--show');
  }

  if (event.target.classList.contains('back-to-menu')) {
    window.location.reload();
  }
});


const recordsItemsHtml = document.querySelector('.records__items');

const renderRecords = (id) => {
  recordsItemsHtml.innerHTML = '';
  const records = JSON.parse(window.localStorage.getItem('records'));
  const recordsById = records.filter(item => item.id == id);

  recordsById.sort((a, b) => b.score.points - a.score.points);

  recordsById.forEach((record, index) => {
    const recordComponent = `
      <div class="records__item">
          <span class="number">${index + 1}.</span>
          <img src="${record.img}" alt="">
          <div class="records__item-content">
            <div class="records__item-title">${record.name}</div>
            <div class="records__points-wrapper">Количество очков: <span class="records__points">${record.score.points}</span></div>
          </div>
          <div class="menu__item-statistic">
              <div class="item-statistic__hits">Кол-во попаданий: ${record.score.success}</div>
              <div class="item-statistic__hits">Кол-во промахов: ${record.score.missHit}</div>
            </div>
        </div>
    `;
    recordsItemsHtml.insertAdjacentHTML('beforeend', recordComponent)
  });
};



//функция которая вызывает timeOut, сохраняет его id, и вызывает коллбэк
function scheduleOfTimers(ms, callback) {
  const timerId = setTimeout(() => {
    callback();
    timersIds.splice(timersIds.indexOf(timerId), 1);
  }, ms);
  timersIds.push(timerId);
};

//функция которая отменяет запланированные вызовы таймаутов
function clearAllTimeouts() {
  timersIds.forEach(id => {
    clearTimeout(id);
  });

  timersIds.length = 0;
};