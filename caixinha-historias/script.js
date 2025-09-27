// Estado global da aplicação
let currentScreen = 'home-screen';
let currentScene = 0;
let currentQuestion = 0;
let gameAnswered = false;
let currentTheme = '';

// Dados carregados dinamicamente
let storyScenes = [];
let gameQuestions = [];
let musicData = {};

// Função para carregar conteúdo de um tema
async function loadThemeContent(theme) {
    try {
        currentTheme = theme;
        
        // Carregar história
        const historyResponse = await fetch(`content/${theme}/historia.json`);
        storyScenes = await historyResponse.json();
        
        // Carregar jogo
        const gameResponse = await fetch(`content/${theme}/jogo.json`);
        gameQuestions = await gameResponse.json();
        
        // Carregar música
        const musicResponse = await fetch(`content/${theme}/musica.json`);
        musicData = await musicResponse.json();
        
        console.log(`Conteúdo do tema "${theme}" carregado com sucesso!`);
        return true;
    } catch (error) {
        console.error(`Erro ao carregar conteúdo do tema "${theme}":`, error);
        return false;
    }
}

// Funções de navegação
function showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar a tela desejada
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

async function selectTheme(theme) {
    if (theme === 'amizade') {
        // Mostrar indicador de carregamento
        const loadingMessage = document.createElement('div');
        loadingMessage.id = 'loading-message';
        loadingMessage.innerHTML = '<p>Carregando conteúdo...</p>';
        loadingMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 1000;';
        document.body.appendChild(loadingMessage);
        
        // Carregar conteúdo do tema
        const success = await loadThemeContent('amizade-cooperacao');
        
        // Remover indicador de carregamento
        document.body.removeChild(loadingMessage);
        
        if (success) {
            showScreen('activities-screen');
        } else {
            alert('Erro ao carregar o conteúdo. Tente novamente.');
        }
    }
}

function goHome() {
    showScreen('home-screen');
}

function goToActivities() {
    showScreen('activities-screen');
}

function startActivity(activity) {
    // Verificar se o conteúdo foi carregado
    if (!currentTheme) {
        alert('Por favor, selecione um tema primeiro.');
        return;
    }
    
    switch(activity) {
        case 'teatro':
            if (storyScenes.length === 0) {
                alert('História não carregada. Tente selecionar o tema novamente.');
                return;
            }
            initTeatro();
            showScreen('teatro-screen');
            break;
        case 'jogo':
            if (gameQuestions.length === 0) {
                alert('Jogo não carregado. Tente selecionar o tema novamente.');
                return;
            }
            initGame();
            showScreen('jogo-screen');
            break;
        case 'musica':
            if (!musicData.title) {
                alert('Música não carregada. Tente selecionar o tema novamente.');
                return;
            }
            initMusic();
            showScreen('musica-screen');
            break;
    }
}

// Função para inicializar a música
function initMusic() {
    const musicTitle = document.querySelector('.music-title h3');
    const musicSubtitle = document.querySelector('.music-title p');
    const lyricsDisplay = document.getElementById('lyrics-display');
    const musicInstructions = document.querySelector('.music-instructions');
    
    // Atualizar título e subtítulo
    if (musicTitle) musicTitle.textContent = `"${musicData.title}"`;
    if (musicSubtitle) musicSubtitle.textContent = musicData.subtitle;
    
    // Limpar e recriar as seções de letra
    if (lyricsDisplay) {
        lyricsDisplay.innerHTML = '';
        
        musicData.lyrics.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'lyrics-section';
            
            const sectionTitle = document.createElement('h4');
            sectionTitle.textContent = section.type.charAt(0).toUpperCase() + section.type.slice(1) + ':';
            
            const sectionText = document.createElement('p');
            sectionText.innerHTML = section.text.replace(/\n/g, '<br>');
            
            sectionDiv.appendChild(sectionTitle);
            sectionDiv.appendChild(sectionText);
            lyricsDisplay.appendChild(sectionDiv);
        });
    }
    
    // Atualizar instruções
    if (musicInstructions) {
        musicInstructions.innerHTML = musicData.instructions;
    }
}

// Funções do Teatro de Fantoches
function initTeatro() {
    currentScene = 0;
    updateSceneDisplay();
    updateControls();
}

function startStory() {
    currentScene = 1;
    updateSceneDisplay();
    updateControls();
    
    // Esconder o botão "Começar"
    document.getElementById('start-btn').style.display = 'none';
}

function nextScene() {
    if (currentScene < storyScenes.length) {
        currentScene++;
        updateSceneDisplay();
        updateControls();
    }
}

function previousScene() {
    if (currentScene > 1) {
        currentScene--;
        updateSceneDisplay();
        updateControls();
    }
}

function updateSceneDisplay() {
    const sceneImage = document.getElementById('scene-image');
    const storyText = document.getElementById('story-text');
    const sceneCounter = document.getElementById('scene-counter');
    const charactersContainer = document.getElementById('characters-container');
    
    if (currentScene === 0) {
        sceneImage.src = '';
        sceneImage.style.display = 'none';
        storyText.textContent = 'Clique em "Começar" para iniciar a história!';
        sceneCounter.textContent = 'Cena 0 de 5';
        charactersContainer.innerHTML = '';
        return;
    }
    
    const scene = storyScenes[currentScene - 1];
    
    // Atualizar imagem de fundo
    sceneImage.src = scene.image;
    sceneImage.style.display = 'block';
    
    // Atualizar texto
    storyText.textContent = scene.text;
    
    // Atualizar contador
    sceneCounter.textContent = `Cena ${currentScene} de 5`;
    
    // Atualizar personagens
    charactersContainer.innerHTML = '';
    scene.characters.forEach((charSrc, index) => {
        const charImg = document.createElement('img');
        charImg.src = charSrc;
        charImg.className = 'character';
        charImg.style.animationDelay = `${index * 0.2}s`;
        charactersContainer.appendChild(charImg);
    });
}

function updateControls() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const startBtn = document.getElementById('start-btn');
    
    if (currentScene === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        startBtn.style.display = 'inline-block';
    } else {
        startBtn.style.display = 'none';
        prevBtn.disabled = currentScene <= 1;
        nextBtn.disabled = currentScene >= storyScenes.length;
    }
}

// Funções do Jogo
function initGame() {
    currentQuestion = 0;
    gameAnswered = false;
    updateGameDisplay();
    resetGameButtons();
}

function updateGameDisplay() {
    const gameImage = document.getElementById('game-image');
    const gameCounter = document.getElementById('game-counter');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    
    if (currentQuestion < gameQuestions.length) {
        const question = gameQuestions[currentQuestion];
        gameImage.src = question.image;
        gameCounter.textContent = `Pergunta ${currentQuestion + 1} de ${gameQuestions.length}`;
        
        // Esconder feedback
        feedbackOverlay.classList.remove('show', 'correct', 'wrong');
        
        // Esconder botões de navegação
        document.getElementById('next-question-btn').style.display = 'none';
        document.getElementById('restart-game-btn').style.display = 'none';
    }
}

function answerGame(userAnswer) {
    if (gameAnswered) return;
    
    gameAnswered = true;
    const question = gameQuestions[currentQuestion];
    const isCorrect = userAnswer === question.correct;
    
    // Mostrar feedback visual
    showGameFeedback(isCorrect, question.feedback);
    
    // Desabilitar botões de resposta
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Mostrar botão apropriado após delay
    setTimeout(() => {
        if (currentQuestion < gameQuestions.length - 1) {
            document.getElementById('next-question-btn').style.display = 'inline-block';
        } else {
            document.getElementById('restart-game-btn').style.display = 'inline-block';
        }
    }, 2000);
}

function showGameFeedback(isCorrect, feedbackText) {
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackContent = document.getElementById('feedback-content');
    
    feedbackContent.textContent = isCorrect ? '⭐✨' : '❌';
    feedbackOverlay.classList.add('show', isCorrect ? 'correct' : 'wrong');
    
    // Mostrar texto de feedback após um momento
    setTimeout(() => {
        alert(feedbackText);
    }, 1000);
}

function nextQuestion() {
    currentQuestion++;
    gameAnswered = false;
    updateGameDisplay();
    resetGameButtons();
}

function restartGame() {
    initGame();
}

function resetGameButtons() {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = false;
    });
}

// Efeitos visuais e animações
function addSparkleEffect(element) {
    element.style.animation = 'sparkle 0.6s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// CSS para animação de brilho
const sparkleCSS = `
@keyframes sparkle {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); filter: brightness(1.2); }
    100% { transform: scale(1); }
}
`;

// Adicionar CSS de animação ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = sparkleCSS;
document.head.appendChild(styleSheet);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar tela inicial
    showScreen('home-screen');
    
    // Adicionar efeitos de hover aos cards
    document.querySelectorAll('.theme-card:not(.disabled)').forEach(card => {
        card.addEventListener('mouseenter', function() {
            addSparkleEffect(this);
        });
    });
    
    document.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            addSparkleEffect(this);
        });
    });
    
    console.log('Caixinha de Histórias do Bem carregada com sucesso!');
});

// Função para tocar sons (placeholder - pode ser implementada futuramente)
function playSound(soundType) {
    // Placeholder para efeitos sonoros
    console.log(`Playing sound: ${soundType}`);
}

// Função para adicionar efeitos de partículas (placeholder)
function createParticles(element) {
    // Placeholder para efeitos de partículas
    console.log('Creating particle effects');
}

