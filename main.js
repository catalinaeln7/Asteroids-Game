// ------------------------------ SETUP ---------------------------------------
const canvas = document.getElementById("canvasAsteroids");
canvas.width = 1500;
canvas.height = 720;

const context = canvas.getContext("2d");

var nava = {
    /* Ma folosesc de centrul de greutate pentru a desena nava ca in momentul in 
    care vreau sa o rotesc, punctele sa ramana pe cercul circumscris */
    centruGreutate: {
        x: canvas.width / 2.0,
        y: canvas.height / 2.0
    },
    // Coordonatele varfului navei
    varf: {
        x: 0.0,
        y: 0.0
    },
    /* Coordonatele centrului bazei triunghiului -> folosite pentru aflarea
    pantei traiectoriei rachetelor */
    bazaTriunghi: {
        x: 0.0,
        y: 0.0
    },
    // Coordonatele coltului stang al navei
    coltStanga: {
        x: 0.0,
        y: 0.0
    },
    // Coordonatele coltului drept al navei
    coltDreapta: {
        x: 0.0,
        y: 0.0
    },
    h: 51.0,    /* inaltimea triunghiului -> ma folosesc de ea ca sa calculez
                varfurile triunghiului raportate la centrul de greutate */
    offset: 17.0,    /* offset-ul colturilor stanga/dreapta fata de mijlocul
                     bazei triunghiului */
    unghi: 0.0,    /* unghiul pe care nava il formeaza cu axa negativa Oy
                     (originea canvasului se afla in stanga-sus) */
};

var rachete = {
    // Numarul maxim de rachete care pot fi lansate la un moment dat
    nr: 3,
    /* Informatii despre rachete: coordonatele actualizate, coordonatele
    initiale (folosite la calculul noii pozitii), panta traiectoriei pe
    care se deplaseaza si un boolean care indica daca racheta trebuie
    randata pe ecran sau nu */
    info: [
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            lansata: false
        }, 
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            lansata: false
        }, 
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            lansata: false
        }
    ]
};

var asteroizi = {
    /* Informatii despre asteroizi: coordonatele actualizate, coordonatele
    initiale (folosite la calculul noii pozitii), panta traiectoriei pe
    care se deplaseaza, numarul de gloante necesare pentru distrugerea sa,
    culoarea asteroidului, unghi generat aleatoriu pentru traiectorie, raza
    sa si un boolean care indica daca asteroidul trebuie generat din nou
    (a iesit din cadru sau a fost distrus) */
    info: [
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            nrGloante: 0,
            culoare: "black",
            unghi: 0.0,
            raza: 0.0,
            generat: false
        }, 
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            nrGloante: 0,
            culoare: "black",
            unghi: 0.0,
            raza: 0.0,
            generat: false
        }, 
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            nrGloante: 0,
            culoare: "black",
            unghi: 0.0,
            raza: 0.0,
            generat: false
        },
        {
            x: 0.0,
            y: 0.0,
            xStart: 0.0,
            yStart: 0.0,
            pantaTraiectorie: 0.0,
            nrGloante: 0,
            culoare: "black",
            unghi: 0.0,
            raza: 0.0,
            generat: false
        }
    ]
};

var tabela = {
    nrVieti: 5, // Numarul maxim de vieti
    scor: 0 // Scorul jucatorului
};

// Culorile posibile pentru diferitele tipuri de asteroizi
var culoriAsteroizi = ["darkorchid", "purple", "crimson", "maroon"];

// Razele posibile pentru diferitele tipuri de asteroizi
var razeAsteroizi = [25, 35, 45, 55];

// Ajuta la regenerarea de vieti - la depasirea unui anumit scor
var pragViataNoua = 0;

// Indica daca jocul s-a terminat sau nu
var gameOn = true;

// Numarul de cadre pe secunda
const fps = 60; 

// Bucla de joc
setInterval(actualizare, 1000 / fps);

// Verificare input tastatura
verificareTaste();

// ------------------------------- BUCLA DE JOC -------------------------------
function actualizare() {
    // In aceasta functie voi crea spatiul in care se deruleaza jocul,
    // voi crea nava spatiala, modul cum aceasta se roteste si cum se misca

    // Desenare spatiu
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (gameOn === true) {
        actualizareCoordonateNava();
        desenareNava();
        desenareRachete();
        desenareAsteroizi();
        tabelaScor();

        coliziuneRachetaAsteroid();
        coliziuneNavaAsteroid();
        verificareNrVieti();
        regenerareNrVieti();
    } else {
        gameOver();
    }
}

// ----------------------------- CONTROL TASTATURA ----------------------------
function verificareTaste() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowUp')   // deplasare in sus
            nava.centruGreutate.y -= 5.0;
        else if (event.key === 'ArrowLeft')   // deplasare spre stanga
            nava.centruGreutate.x -= 5.0;
        else if (event.key === 'ArrowRight')   // deplasare spre dreapta
            nava.centruGreutate.x += 5.0;
        else if (event.key === 'ArrowDown')   // deplasare in jos
            nava.centruGreutate.y += 5.0;
        else if (event.key === 'z') {   // rotire in sens trigonometric
            nava.unghi -= 5.0;
            if (nava.unghi < 0.0) nava.unghi += 360.0;
        } else if (event.key === 'c') {   // rotire in sensul acelor de ceasornic
            nava.unghi += 5.0;
            if (nava.unghi >= 360.0) nava.unghi -= 360.0;
        } else if (event.key === 'x')   // lansare racheta
            lanseazaRacheta();
        else if (event.key === 'r') {   // restart joc
            gameOn = true;
            tabela.nrVieti = 5;
            tabela.scor = 0;
        }
    }, false);
}

function lanseazaRacheta() {
    if (rachete.nr > 0) {
        rachete.nr -= 1;

        // actualizez informatiile pentru toate rachetele
        for (let i = 0; i < 3; i++) {
            // daca nu a fost lansata o initializez
            if (rachete.info[i].lansata === false) {    
                // racheta pleaca din varful navei
                rachete.info[i].x = Math.round(nava.varf.x);    
                rachete.info[i].y = Math.round(nava.varf.y);
                rachete.info[i].xStart = rachete.info[i].x;
                rachete.info[i].yStart = rachete.info[i].y;
                // am nevoie de unghi si panta ca sa calculez noile coordonate ale rachetelor
                rachete.info[i].unghi = nava.unghi;
                rachete.info[i].pantaTraiectorie = pantaAB(nava.bazaTriunghi, nava.varf);
                // racheta a fost lansata
                rachete.info[i].lansata = true;
                break; // doar prima racheta nelansata se initializeaza
            }
        }
    }
}

// panta segmentului AB
function pantaAB(A, B) {
    return (B.y - A.y) / (B.x - A.x);
}

// ----------------------------------- NAVA SPATIALA --------------------------
function desenareNava() {
    context.strokeStyle = "white";
    context.lineWidth = 2.0;
    context.beginPath();
    context.moveTo(nava.varf.x, nava.varf.y); // varful navei
    context.lineTo(nava.coltStanga.x, nava.coltStanga.y); // coltul stanga jos
    context.lineTo(nava.coltDreapta.x,nava.coltDreapta.y);    // coltul dreapta jos
    context.closePath();
    context.stroke();
}

function actualizareCoordonateNava() {
    // calculez coordonatele varfului fata de centrul de greutate
    // x se pastreaza, y scade (y=0 e sus) cu 2/3 din inaltime
    // rotesc varful in jurul centrului de greutate
    nava.varf.x = nava.centruGreutate.x;
    nava.varf.y = nava.centruGreutate.y - 2.0 * nava.h / 3.0;
    nava.varf = rotirePunct(nava.varf);

    // calculez coordonatele coltului stanga fata de centrul de greutate
    // x scade cu un offset stabilit, y creste (y=0 e sus) cu 1/3 din inaltime
    // rotesc coltul in jurul centrului de greutate
    nava.coltStanga.x = nava.centruGreutate.x - nava.offset;
    nava.coltStanga.y = nava.centruGreutate.y + nava.h / 3.0;
    nava.coltStanga = rotirePunct(nava.coltStanga);

    // calculez coordonatele coltului dreapta fata de centrul de greutate
    // x creste cu un offset stabilit, y creste (y=0 e sus) cu 1/3 din inaltime
    // rotesc coltul in jurul centrului de greutate
    nava.coltDreapta.x = nava.centruGreutate.x + nava.offset;
    nava.coltDreapta.y = nava.centruGreutate.y + nava.h / 3.0;
    nava.coltDreapta = rotirePunct(nava.coltDreapta);

    // calculez coordonatele centrului bazei folosind colturile stanga-dreapta
    nava.bazaTriunghi.x = (nava.coltStanga.x + nava.coltDreapta.x) / 2.0;
    nava.bazaTriunghi.y = (nava.coltStanga.y + nava.coltDreapta.y) / 2.0;
}

function rotirePunct(point) {
    // ma folosesc de unghiul navei pentru a afla sinusul si cosinusul
    const s = Math.sin(nava.unghi * Math.PI / 180);
    const c = Math.cos(nava.unghi * Math.PI / 180);

    /* trebuie sa translatez punctul in jurul careia se roteste coltul navei
    in (0, 0) - centrul de greutate ajunge in origine => trebuie sa scad
    din coordonatele colturilor navei pe cele ale centrului de greutate */
    point.x -= nava.centruGreutate.x;
    point.y -= nava.centruGreutate.y;

    // fac rotatia punctului in jurul originii
    const xNew = point.x * c - point.y * s;
    const yNew = point.x * s + point.y * c;

    // readuc coltul in jurul centrului de greutate => adun la loc coordonatele
    point.x = xNew + nava.centruGreutate.x;
    point.y = yNew + nava.centruGreutate.y;

    return point;
}

// -------------------------------------- RACHETE -----------------------------
function desenareRachete() {
    if (rachete.nr === 3) return;   // daca nu e lansata nicio racheta nu desenez nimic

    context.fillStyle = "white";
    for (let i = 0; i < 3; i++) {
        // daca o racheta e lansata trebuie sa o desenez
        if (rachete.info[i].lansata === true) {
            rachetaAfaraDinCadru(i);
            actualizareCoordonateRacheta(i);
            
            // rachetele sunt patrate de 3x3
            context.fillRect(rachete.info[i].x, rachete.info[i].y, 3, 3);
        }
    }
}

function actualizareCoordonateRacheta(i) {
    // am luat unghiurile divizibile cu 90 separat din cauza pantei care iese in unghiurile alea
    if (rachete.info[i].unghi == 0.0) {
        rachete.info[i].y -= 2.5;
    } else if (rachete.info[i].unghi == 90.0) {
        rachete.info[i].x += 2.5;
    } else if (rachete.info[i].unghi == 180.0) { 
        rachete.info[i].y += 2.5;
    } else if (rachete.info[i].unghi == 270.0) {
        rachete.info[i].x -= 2.5;
    } else {
        // daca racheta are varful in dreapta trebuie sa creasca x-ul
        // altfel trebuie sa scada x-ul
        if (rachete.info[i].unghi < 180)
            rachete.info[i].x += 2.5;
        else 
            rachete.info[i].x -= 2.5;
        
        // formula scoasa din ecuatia dreptei y-y0=m(x-x0)
        rachete.info[i].y = (rachete.info[i].x - rachete.info[i].xStart) * rachete.info[i].pantaTraiectorie + rachete.info[i].yStart;     
    }
}

function rachetaAfaraDinCadru(i) {
    // verific daca racheta a iesit din cadru
    if (rachete.info[i].x < 0 || rachete.info[i].x > canvas.width ||
        rachete.info[i].y < 0 || rachete.info[i].y > canvas.height) {
        rachete.nr += 1;   // cresc numarul de rachete nelansate
        rachete.info[i].lansata = false;
    }
}

// ------------------------------------- ASTEROIZI ---------------------------
function desenareAsteroizi() {
    for (var i = 0; i < 4; i++) {
        asteroidAfaraDinCadru(i);
        actualizareCoordonateAsteroid(i);

        if (asteroizi.info[i].generat === false) {
            generareAsteroid(i);
            asteroizi.info[i].generat = true;
        }

        context.beginPath();
        context.arc(asteroizi.info[i].x, asteroizi.info[i].y, asteroizi.info[i].raza, 0, 2 * Math.PI);
        context.fillStyle = asteroizi.info[i].culoare;
        context.fill();

        context.font = '30px serif';
        context.textAlign = 'center';
        context.fillStyle = 'white'
        context.fillText(asteroizi.info[i].nrGloante, asteroizi.info[i].x, asteroizi.info[i].y + 10);
    }
}

function generareAsteroid(i) {
    // generez date random pentru asteroid
    var intrareInEcran = Math.floor(Math.random() * 4); // 0: sus, 1: dreapta, 2: jos, 3: stanga
    var tipAsteroid = Math.floor(Math.random() * 4) + 1; // 1: 1 glont, 2: 2 gloante, 3: 3 gloante, 4: 4 gloante

    // pe unde intra asteroizii in ecran
    switch (intrareInEcran) {
        case 0:
            asteroizi.info[i].yStart = asteroizi.info[i].y = 50.0;
            // generez random o coordonata x
            asteroizi.info[i].xStart = asteroizi.info[i].x = Math.random() * 500 + 500;
            break;
        case 1:
            asteroizi.info[i].xStart = asteroizi.info[i].x = 50.0;
            // generez random o coordonata y
            asteroizi.info[i].yStart = asteroizi.info[i].y = Math.random() * 240 + 240;
            break;

        case 2:
            asteroizi.info[i].yStart = asteroizi.info[i].y = canvas.height - 50.0;
            // generez random o coordonata x
            asteroizi.info[i].xStart = asteroizi.info[i].x = Math.random() * 500 + 500;
            break;

        case 3:
            asteroizi.info[i].xStart = asteroizi.info[i].x = canvas.width - 50.0;
            // generez random o coordonata y
            asteroizi.info[i].yStart = asteroizi.info[i].y = Math.random() * 240 + 240;
            break;
    }

    asteroizi.info[i].raza = razeAsteroizi[tipAsteroid - 1];   // asignez raza specifica tipului de asteroid
    asteroizi.info[i].culoare = culoriAsteroizi[tipAsteroid - 1];   // asignez culoarea specifica
    asteroizi.info[i].nrGloante = tipAsteroid;   // asignez numarul de gloante necesare distrugerii asteroidului
    asteroizi.info[i].pantaTraiectorie = Math.random() * Math.PI - Math.PI / 2.0;   // generez o panta aleatoare
    asteroizi.info[i].directie = intrareInEcran;   // trebuie sa stiu de unde intra ca sa stiu in ce directie o ia asteroidul
}

function asteroidAfaraDinCadru(i) {
    // verific daca asteroidul a iesit din cadru
    if (asteroizi.info[i].x < 0 || asteroizi.info[i].x > canvas.width ||
        asteroizi.info[i].y < 0 || asteroizi.info[i].y > canvas.height) {
        asteroizi.info[i].generat = false;
    }
}

function actualizareCoordonateAsteroid(i) {
    // in functie de unde intra asteroidul ii stabilesc o traiectorie care nu iese direct din ecran
    switch (asteroizi.info[i].directie) {
        case 0: // de sus
            asteroizi.info[i].y += 0.5;
            asteroizi.info[i].x = (asteroizi.info[i].y - asteroizi.info[i].yStart) / asteroizi.info[i].pantaTraiectorie + asteroizi.info[i].xStart;     
            break;
        case 1: // din dreapta
            asteroizi.info[i].x -= 0.5;
            asteroizi.info[i].y = (asteroizi.info[i].x - asteroizi.info[i].xStart) * asteroizi.info[i].pantaTraiectorie + asteroizi.info[i].yStart;     
            break;
        case 2: // de jos
            asteroizi.info[i].y -= 0.5;
            asteroizi.info[i].x = (asteroizi.info[i].y - asteroizi.info[i].yStart) / asteroizi.info[i].pantaTraiectorie + asteroizi.info[i].xStart;     
            break;
        case 3: // din stanga
            asteroizi.info[i].x += 0.5;
            asteroizi.info[i].y = (asteroizi.info[i].x - asteroizi.info[i].xStart) * asteroizi.info[i].pantaTraiectorie + asteroizi.info[i].yStart;     
            break;
    }
}

// -------------------------------- RANDARE TEXT TABELA -----------------------
function tabelaScor() {
    context.font = '40px serif';
    context.textAlign = 'left';
    context.fillStyle = 'white'
    context.fillText("Scor: " + tabela.scor, 100, 50);
    context.fillText("Vieti: " + tabela.nrVieti, 100, 100);
}

// ----------------------- VERIFICARE COLIZIUNE RACHETA-ASTEROID --------------
function coliziuneRachetaAsteroid() {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 4; j++) {
            if (rachete.info[i].lansata === true) {
                // calculez distanta dintre racheta si centrul asteroidului
                var dist = Math.sqrt(Math.pow((rachete.info[i].x - asteroizi.info[j].x), 2) 
                                     + Math.pow((rachete.info[i].y - asteroizi.info[j].y), 2));
                // daca distanta e mai mica decat raza asteroidului -> coliziune
                if (dist <= asteroizi.info[j].raza) {
                    // punctaj bazat pe tipul de asteroid
                    tabela.scor += asteroizi.info[j].raza;
                    // trebuie sa retin punctajul ca sa regenerez vietile
                    pragViataNoua += asteroizi.info[j].raza;

                    // resetez racheta
                    rachete.nr += 1;
                    rachete.info[i].lansata = false;

                    // schimb caracteristicile asteroidului
                    asteroizi.info[j].nrGloante -= 1;
                    asteroizi.info[j].raza = razeAsteroizi[asteroizi.info[j].nrGloante - 1];
                    asteroizi.info[j].culoare = culoriAsteroizi[asteroizi.info[j].nrGloante - 1];

                    // daca asteroidul e distrus nu se mai afiseaza
                    if (asteroizi.info[j].nrGloante == 0) {
                        asteroizi.info[j].generat = false;
                    }
                }
            }
        }
    }
}

// ------------------------- VERIFICARE COLIZIUNE NAVA-ASTEROID ---------------
function coliziuneNavaAsteroid() {
    for (var i = 0; i < 4; i++) {
        // calculez distanta dintre nava si toti asteroizii
        var dist = Math.sqrt(Math.pow((nava.centruGreutate.x - asteroizi.info[i].x), 2) 
                            + Math.pow((nava.centruGreutate.y - asteroizi.info[i].y), 2));
        // daca distanta e mai mica decat raza cercului inscris + raza asteroidului -> coliziune
        // scade numarul de vieti si resetez pozitia navei
        if (dist <= nava.h / 3.0 + asteroizi.info[i].raza) {
            tabela.nrVieti -= 1;
            nava.centruGreutate.x = canvas.width / 2.0;
            nava.centruGreutate.y = canvas.height / 2.0;
            nava.unghi = 0.0;
        }
    }
}

// ------------------------------ REGENERARE NUMAR VIETI ----------------------
function regenerareNrVieti() {
    // de fiecare data cand trec de un punctaj divizibil cu 500 mai pot obtine 
    // o viata - daca numarul de vieti nu e maxim
    if (pragViataNoua > 500) {
        pragViataNoua = 1000 - pragViataNoua;

        if (tabela.nrVieti < 5)
            tabela.nrVieti += 1;
    }
}

// ------------------------------- VERIFICARE GAME OVER -----------------------
function verificareNrVieti() {
    // daca jucatorul nu mai are vieti -> stop
    if (tabela.nrVieti === 0) {
        gameOn = false;

        for (var i = 0; i < 4; i++) {
            asteroizi.info[i].generat = false;
        }
    }
}

// ----------------------------------- GAME OVER ------------------------------
function gameOver() {
    context.font = '40px serif';
    context.textAlign = 'center';
    context.fillStyle = 'white'
    context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    context.fillText("Final score: " + tabela.scor, canvas.width / 2, canvas.height / 2 + 20);

    context.font = '20px serif';
    context.fillText("Apasa tasta 'R' pentru a juca din nou", canvas.width / 2, canvas.height / 2 + 70);
}
