const FADE_DURATION = 100
// Update audio paths to use the three specific files
const AUDIO_PATHS = {
  correct: "resources/audio/correct.wav",
  lap: "resources/audio/lap.wav",
  mistake: "resources/audio/mistake.wav",
}

// Update the state object to include an allLessons flag
const state = {
  currentCategory: "sentences",
  chunkSize: 10,
  data: [],
  filteredData: [], // Data filtered by current lesson
  currentIndex: 0,
  isRevealed: false,
  isEnglishToHebrew: true,
  randomizedIndices: [],
  completedItems: 0,
  remainingIndices: [],
  showingFeedback: false,
  audioContext: null,
  audioBuffers: {}, // Will store the three audio buffers
  currentChunkIndices: [],
  completedChunkIndices: new Set(),
  masterIndices: [],
  isMenuOpen: false,
  currentLesson: 1, // Default to Lesson 1
  soundTheme: "adjacent", // Default sound theme set to "adjacent"
  allLessons: false, // Flag to indicate if all lessons are selected
  colorTheme: "pastel", // Default color theme
}

// Update AUDIO_PATHS to be a function that returns paths based on the current theme
const getAudioPaths = (theme) => {
  return {
    correct: `resources/audio/${theme}_correct.wav`,
    lap: `resources/audio/${theme}_lap.wav`,
    mistake: `resources/audio/${theme}_mistake.wav`,
  }
}

// In the createMenuGrid function, replace the entire function with this corrected version
// that properly orders the sections and fixes the duplication issue

const createMenuGrid = () => {
  const menuGrid = document.getElementById("menu-grid")

  // Only create the menu if it doesn't exist or has no children
  if (menuGrid && menuGrid.children.length === 0) {
    // Create menu category select
    const menuCategoryContainer = document.createElement("div")
    menuCategoryContainer.className = "menu-control-container"

    const menuCategoryLabel = document.createElement("div")
    menuCategoryLabel.className = "menu-label"
    menuCategoryLabel.textContent = "Category:"

    const menuCategorySelect = document.createElement("select")
    menuCategorySelect.id = "menu-category-select"
    menuCategorySelect.className = "glass-select menu-select"

    const categories = [
      { value: "sentences", text: "Sentences" },
      { value: "verbs", text: "Verbs" },
      { value: "nouns", text: "Nouns" },
      { value: "adjectives", text: "Adjectives" },
    ]

    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category.value
      option.text = category.text
      if (category.value === state.currentCategory) option.selected = true
      menuCategorySelect.appendChild(option)
    })

    menuCategorySelect.addEventListener("change", function () {
      state.currentCategory = this.value
      const appCategorySelect = document.getElementById("category-select")
      if (appCategorySelect) appCategorySelect.value = this.value
      loadData(state.currentCategory)
    })

    menuCategoryContainer.appendChild(menuCategoryLabel)
    menuCategoryContainer.appendChild(menuCategorySelect)
    menuGrid.appendChild(menuCategoryContainer)

    // Create menu chunk size select
    const menuChunkContainer = document.createElement("div")
    menuChunkContainer.className = "menu-control-container"

    const menuChunkLabel = document.createElement("div")
    menuChunkLabel.className = "menu-label"
    menuChunkLabel.textContent = "Chunk Size:"

    const menuChunkSelect = document.createElement("select")
    menuChunkSelect.id = "menu-chunk-select"
    menuChunkSelect.className = "glass-select menu-select"

    for (let size = 10; size <= 100; size += 10) {
      const option = document.createElement("option")
      option.value = size
      option.text = `${size} words`
      if (size === state.chunkSize) option.selected = true
      menuChunkSelect.appendChild(option)
    }

    menuChunkSelect.addEventListener("change", function () {
      state.chunkSize = Number.parseInt(this.value)
      const appChunkSelect = document.getElementById("chunk-select")
      if (appChunkSelect) appChunkSelect.value = this.value
      filterDataByLesson()
      initializeRandomization()
      updateUI()
    })

    menuChunkContainer.appendChild(menuChunkLabel)
    menuChunkContainer.appendChild(menuChunkSelect)
    menuGrid.appendChild(menuChunkContainer)

    // Create lesson buttons - MOVED UP BEFORE SOUND THEME
    const lessonContainer = document.createElement("div")
    lessonContainer.className = "lesson-container"
    lessonContainer.style.gridColumn = "span 2"

    const lessonLabel = document.createElement("div")
    lessonLabel.className = "menu-label"
    lessonLabel.textContent = "Lesson:" // Changed from "Select Lesson:" to "Lesson:"
    lessonContainer.appendChild(lessonLabel)

    const lessonButtonsContainer = document.createElement("div")
    lessonButtonsContainer.className = "lesson-buttons-container"

    // Add "All Lessons" button
    const allLessonsButton = document.createElement("button")
    allLessonsButton.className = `menu-item full-width-button ${state.allLessons ? "active-lesson" : ""}`
    allLessonsButton.id = "lesson-all"
    allLessonsButton.innerHTML = '<span class="button-text">All Lessons</span>'
    allLessonsButton.onclick = () => {
      // Remove active class from all lesson buttons
      document.querySelectorAll(".menu-item").forEach((item) => {
        item.classList.remove("active-lesson")
      })
      // Add active class to clicked button
      allLessonsButton.classList.add("active-lesson")
      // Update state
      state.allLessons = true
      state.currentLesson = 0 // Use 0 to indicate all lessons
      // Filter data by lesson and update UI
      filterDataByLesson()
      initializeRandomization()
      updateUI()

      console.log("Selected All Lessons")
    }
    lessonButtonsContainer.appendChild(allLessonsButton)

    const lessons = Array.from({ length: 12 }, (_, i) => i + 1)

    lessons.forEach((lessonNumber) => {
      const menuItem = document.createElement("button")
      menuItem.className = `menu-item ${!state.allLessons && lessonNumber === state.currentLesson ? "active-lesson" : ""}`
      menuItem.id = `lesson-${lessonNumber}`
      menuItem.innerHTML = `<span class="button-text">Lesson ${lessonNumber}</span>`
      menuItem.onclick = () => {
        // Remove active class from all lesson buttons
        document.querySelectorAll(".menu-item").forEach((item) => {
          item.classList.remove("active-lesson")
        })
        // Add active class to clicked button
        menuItem.classList.add("active-lesson")
        // Update state
        state.allLessons = false
        state.currentLesson = lessonNumber
        // Filter data by lesson and update UI
        filterDataByLesson()
        initializeRandomization()
        updateUI()

        console.log(`Selected Lesson ${lessonNumber}`)
      }
      lessonButtonsContainer.appendChild(menuItem)
    })

    lessonContainer.appendChild(lessonButtonsContainer)
    menuGrid.appendChild(lessonContainer)

    // Create sound theme select - MOVED DOWN AFTER LESSON SECTION
    const menuSoundThemeContainer = document.createElement("div")
    menuSoundThemeContainer.className = "menu-control-container"

    const menuSoundThemeLabel = document.createElement("div")
    menuSoundThemeLabel.className = "menu-label"
    menuSoundThemeLabel.textContent = "Sound Theme:"

    const menuSoundThemeSelect = document.createElement("select")
    menuSoundThemeSelect.id = "menu-sound-theme-select"
    menuSoundThemeSelect.className = "glass-select menu-select"

    const soundThemes = [
      { value: "adjacent", text: "Adjacent" },
      { value: "cone", text: "Cone" },
      { value: "spline", text: "Spline" },
      { value: "vector", text: "Vector" },
    ]

    soundThemes.forEach((theme) => {
      const option = document.createElement("option")
      option.value = theme.value
      option.text = theme.text
      if (theme.value === state.soundTheme) option.selected = true
      menuSoundThemeSelect.appendChild(option)
    })

    menuSoundThemeSelect.addEventListener("change", function () {
      state.soundTheme = this.value
      // Reload audio files with the new theme
      initializeAudioSystem()
    })

    menuSoundThemeContainer.appendChild(menuSoundThemeLabel)
    menuSoundThemeContainer.appendChild(menuSoundThemeSelect)
    menuGrid.appendChild(menuSoundThemeContainer)

    // Add after the sound theme select creation in createMenuGrid
    const menuColorThemeContainer = document.createElement("div")
    menuColorThemeContainer.className = "menu-control-container"

    const menuColorThemeLabel = document.createElement("div")
    menuColorThemeLabel.className = "menu-label"
    menuColorThemeLabel.textContent = "Color Theme:"

    const menuColorThemeSelect = document.createElement("select")
    menuColorThemeSelect.id = "menu-color-theme-select"
    menuColorThemeSelect.className = "glass-select menu-select"

    const colorThemes = [
      {
        value: "pastel",
        text: "Pastel",
        colors: {
          primary: "#816450",
          secondary: "#d9dcbb",
          tertiary: "#e1ded9",
          quaternary: "#b6a69a",
          quinary: "#d3a6b9",
          background: "#e2c4c4",
          orange: "#C16E70",
          green: "#C8D6AF",
        },
      },
      {
        value: "thompson",
        text: "Thompson",
        colors: {
          primary: "#4A3B2F",
          secondary: "#F4D03F",
          tertiary: "#E9DAC1",
          quaternary: "#D9A566", // Lighter orange-brown for buttons
          quinary: "#7BA05B",
          background: "#4A3B2F", // Dark brown for page background
          orange: "#D35400",
          green: "#217D7A",
        },
      },
    ]

    colorThemes.forEach((theme) => {
      const option = document.createElement("option")
      option.value = theme.value
      option.text = theme.text
      if (theme.value === state.colorTheme) option.selected = true
      menuColorThemeSelect.appendChild(option)
    })

    menuColorThemeSelect.addEventListener("change", function () {
      state.colorTheme = this.value
      updateColorTheme(state.colorTheme)
    })

    menuColorThemeContainer.appendChild(menuColorThemeLabel)
    menuColorThemeContainer.appendChild(menuColorThemeSelect)
    menuGrid.appendChild(menuColorThemeContainer)
  }
  return menuGrid
}

// Update the filterDataByLesson function to handle the allLessons flag
const filterDataByLesson = () => {
  if (state.data.length === 0) return

  // If allLessons is true, use all data
  if (state.allLessons) {
    state.filteredData = state.data
    console.log(`Using all lessons: ${state.filteredData.length} items`)
    return
  }

  // Filter data to only include items from the current lesson
  state.filteredData = state.data.filter((item) => {
    return item.lesson === state.currentLesson || item.lesson === `Lesson ${state.currentLesson}`
  })

  // If no items match the current lesson, show a message
  if (state.filteredData.length === 0) {
    console.log(`No items found for Lesson ${state.currentLesson}. Using all data.`)
    state.filteredData = state.data // Fallback to all data
  }

  console.log(`Filtered data for Lesson ${state.currentLesson}: ${state.filteredData.length} items`)
}

// Fixed toggle menu visibility function
const toggleMenuVisibility = () => {
  state.isMenuOpen = !state.isMenuOpen

  // Get the main and footer elements
  const main = document.querySelector("main")
  const footer = document.querySelector("footer")
  const categoryGroup = document.querySelector(".control-group:not(:first-child)")
  const menuGrid = document.getElementById("menu-grid")

  // Get the direction button
  const directionButton = document.getElementById("switch-direction")

  if (state.isMenuOpen) {
    // Hide main, footer, and category selection
    main.classList.add("hidden")
    footer.classList.add("hidden")
    categoryGroup.classList.add("hidden")

    // Hide direction button
    if (directionButton) directionButton.style.display = "none"

    // Show menu grid
    menuGrid.classList.add("visible")

    // Sync the menu selects with the app selects
    const appCategorySelect = document.getElementById("category-select")
    const menuCategorySelect = document.getElementById("menu-category-select")
    if (appCategorySelect && menuCategorySelect) {
      menuCategorySelect.value = appCategorySelect.value
    }

    const appChunkSelect = document.getElementById("chunk-select")
    const menuChunkSelect = document.getElementById("menu-chunk-select")
    if (appChunkSelect && menuChunkSelect) {
      menuChunkSelect.value = appChunkSelect.value
    }

    // Update sound theme select
    const menuSoundThemeSelect = document.getElementById("menu-sound-theme-select")
    if (menuSoundThemeSelect) {
      menuSoundThemeSelect.value = state.soundTheme
    }

    // Update active lesson button
    document.querySelectorAll(".menu-item").forEach((item) => {
      if (state.allLessons && item.id === "lesson-all") {
        item.classList.add("active-lesson")
      } else if (!state.allLessons && item.id === `lesson-${state.currentLesson}`) {
        item.classList.add("active-lesson")
      } else {
        item.classList.remove("active-lesson")
      }
    })

    // Update color theme select
    const menuColorThemeSelect = document.getElementById("menu-color-theme-select")
    if (menuColorThemeSelect) {
      menuColorThemeSelect.value = state.colorTheme
    }
  } else {
    // Show main, footer, and category selection
    main.classList.remove("hidden")
    footer.classList.remove("hidden")
    categoryGroup.classList.remove("hidden")

    // Show direction button
    if (directionButton) directionButton.style.display = "block"

    // Hide menu grid
    menuGrid.classList.remove("visible")

    // Sync the app selects with the menu selects
    const appCategorySelect = document.getElementById("category-select")
    const menuCategorySelect = document.getElementById("menu-category-select")
    if (appCategorySelect && menuCategorySelect) {
      appCategorySelect.value = menuCategorySelect.value
      // Trigger change event to update the app
      const event = new Event("change")
      appCategorySelect.dispatchEvent(event)
    }

    const appChunkSelect = document.getElementById("chunk-select")
    const menuChunkSelect = document.getElementById("menu-chunk-select")
    if (appChunkSelect && menuChunkSelect) {
      appChunkSelect.value = menuChunkSelect.value
      // Trigger change event to update the app
      const event = new Event("change")
      appChunkSelect.dispatchEvent(event)
    }
  }

  // Update the menu button text
  const menuButton = document.getElementById("menu-button")
  menuButton.querySelector(".button-text").innerText = state.isMenuOpen ? "Show App" : "Menu"
}

// Update audio initialization to use the current theme
const initializeAudioSystem = async () => {
  try {
    // Create a new audio context if one doesn't exist
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    // Clear existing audio buffers
    state.audioBuffers = {}

    // Get audio paths for the current theme
    const audioPaths = getAudioPaths(state.soundTheme)

    // Load all audio files
    const audioBufferPromises = Object.entries(audioPaths).map(async ([key, path]) => {
      try {
        const response = await fetch(path)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await state.audioContext.decodeAudioData(arrayBuffer)
        state.audioBuffers[key] = audioBuffer
        console.log(`Loaded audio: ${key} (${state.soundTheme} theme)`)
      } catch (error) {
        console.error(`Error loading audio file ${path}:`, error)
      }
    })

    // Wait for all audio files to load
    await Promise.all(audioBufferPromises)
    console.log(`Audio files loaded for theme ${state.soundTheme}:`, Object.keys(state.audioBuffers))
  } catch (error) {
    console.error("Audio initialization error:", error)
  }
}

// Update playback to play the specific audio file
const playAudioFeedback = (type) => {
  if (!state.audioContext || !state.audioBuffers[type]) {
    console.warn(`No audio buffer available for ${type}`)
    return
  }

  console.log(`Playing ${type} audio`)

  const source = state.audioContext.createBufferSource()
  source.buffer = state.audioBuffers[type]
  source.connect(state.audioContext.destination)
  source.start(0)
}

const shuffleArray = (array) => {
  const shuffled = [...Array(array.length).keys()]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const initializeRandomization = () => {
  state.masterIndices = shuffleArray([...Array(state.filteredData.length).keys()])
  initializeNewChunk()
}

const initializeNewChunk = () => {
  const availableIndices = state.masterIndices.filter((i) => !state.completedChunkIndices.has(i))

  if (availableIndices.length === 0) {
    state.completedChunkIndices.clear()
    state.currentChunkIndices = state.masterIndices.slice(0, Math.min(state.chunkSize, state.masterIndices.length))
  } else {
    state.currentChunkIndices = availableIndices.slice(0, Math.min(state.chunkSize, availableIndices.length))
  }

  state.remainingIndices = [...state.currentChunkIndices]
  state.currentIndex = 0
  state.completedItems = 0
  updateProgressDisplay()
}

const fadeIn = (element) => {
  element.style.opacity = 0
  element.style.transition = `opacity ${FADE_DURATION}ms ease`
  setTimeout(() => (element.style.opacity = 1), 50)
}

const fadeOut = (element) => {
  element.style.opacity = 0
  element.style.transition = `opacity ${FADE_DURATION}ms ease`
}

const updateProgressDisplay = () => {
  const progressElement = document.getElementById("progress-display")
  if (progressElement) {
    progressElement.innerText = `${state.completedItems + 1}/${state.currentChunkIndices.length}`
  }
}

const createFeedbackButtons = () => {
  const footerElement = document.querySelector("footer")
  const buttonContainer = document.createElement("div")
  buttonContainer.id = "feedback-buttons"
  buttonContainer.style.display = "none"
  buttonContainer.className = "feedback-container"

  const correctButton = document.createElement("button")
  correctButton.className = "direction-button feedback-button correct"
  correctButton.innerHTML = '<span class="button-text">Correct</span>'
  correctButton.onclick = handleCorrect

  const mistakeButton = document.createElement("button")
  mistakeButton.className = "direction-button feedback-button mistake"
  mistakeButton.innerHTML = '<span class="button-text">Mistake</span>'
  mistakeButton.onclick = handleMistake

  buttonContainer.appendChild(correctButton)
  buttonContainer.appendChild(mistakeButton)
  footerElement.insertBefore(buttonContainer, document.getElementById("show-continue"))
}

const toggleFeedbackButtons = (show) => {
  const feedbackButtons = document.getElementById("feedback-buttons")
  const showButton = document.getElementById("show-continue")

  if (feedbackButtons && showButton) {
    if (show) {
      feedbackButtons.style.display = "flex"
      showButton.style.display = "none"
    } else {
      feedbackButtons.style.display = "none"
      showButton.style.display = "block"
    }
    state.showingFeedback = show
  }
}

// Update the handleCorrect function to play different sounds based on context
const handleCorrect = () => {
  const currentValue = state.remainingIndices[state.currentIndex]
  state.completedItems++
  state.remainingIndices = state.remainingIndices.filter((_, index) => index !== state.currentIndex)

  // Check if this was the last item in the chunk
  const isLastItem = state.remainingIndices.length === 0

  // Play the appropriate sound
  if (isLastItem) {
    playAudioFeedback("lap") // Play lap.wav for completing a chunk
  } else {
    playAudioFeedback("correct") // Play correct.wav for normal correct answers
  }

  if (isLastItem) {
    state.currentChunkIndices.forEach((i) => state.completedChunkIndices.add(i))
    initializeNewChunk()
  } else {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * state.remainingIndices.length)
    } while (state.remainingIndices[newIndex] === currentValue && state.remainingIndices.length > 1)
    state.currentIndex = newIndex
  }

  state.isRevealed = false
  toggleFeedbackButtons(false)
  updateUI()
}

// Update the handleMistake function to use the mistake sound
const handleMistake = () => {
  playAudioFeedback("mistake") // Play mistake.wav

  const currentValue = state.remainingIndices[state.currentIndex]
  state.remainingIndices.splice(state.currentIndex, 1)
  const newPosition = Math.floor(Math.random() * (state.remainingIndices.length - 1)) + 1
  state.remainingIndices.splice(newPosition, 0, currentValue)

  let newIndex
  do {
    newIndex = Math.floor(Math.random() * state.remainingIndices.length)
  } while (state.remainingIndices[newIndex] === currentValue && state.remainingIndices.length > 1)

  state.currentIndex = newIndex
  state.isRevealed = false
  toggleFeedbackButtons(false)
  updateUI()
}

// Add this function to ensure card colors are updated when the UI is updated
const updateUI = () => {
  if (state.filteredData.length === 0) return

  const entry = state.filteredData[state.remainingIndices[state.currentIndex]]
  const englishText = document.getElementById("english-text")
  const hebrewContent = document.getElementById("hebrew-content")

  if (!englishText || !hebrewContent) return

  fadeOut(englishText)
  fadeOut(hebrewContent)

  // Ensure card colors are correct for the current theme
  const englishCard = document.getElementById("english-section")
  const hebrewCard = document.getElementById("hebrew-section")

  if (state.colorTheme === "thompson") {
    if (englishCard) englishCard.style.backgroundColor = "#F2E8DC"
    if (hebrewCard) hebrewCard.style.backgroundColor = "#E8F4D9"
  } else {
    if (englishCard) englishCard.style.backgroundColor = "#D3D4D3"
    if (hebrewCard) hebrewCard.style.backgroundColor = "#F0FFF9"
  }

  setTimeout(() => {
    if (state.isEnglishToHebrew) {
      englishText.innerText = entry.english
      hebrewContent.innerHTML = ""
    } else {
      englishText.innerText = ""
      hebrewContent.innerHTML = formatHebrewContent(entry)
    }

    fadeIn(englishText)
    fadeIn(hebrewContent)
    updateProgressDisplay()
  }, FADE_DURATION)
}

// Add the updateColorTheme function
const updateColorTheme = (themeName) => {
  const colorThemes = [
    {
      value: "pastel",
      text: "Pastel",
      colors: {
        primary: "#816450",
        secondary: "#d9dcbb",
        tertiary: "#e1ded9",
        quaternary: "#b6a69a",
        quinary: "#d3a6b9",
        background: "#e2c4c4",
        orange: "#C16E70",
        green: "#C8D6AF",
      },
    },
    {
      value: "thompson",
      text: "Thompson",
      colors: {
        primary: "#4A3B2F",
        secondary: "#F4D03F",
        tertiary: "#E9DAC1",
        quaternary: "#D9A566", // Lighter orange-brown for buttons
        quinary: "#7BA05B",
        background: "#BCC4DB", // Dark brown for page background
        orange: "#D35400",
        green: "#217D7A",
      },
    },
  ]
  const theme = colorThemes.find((t) => t.value === themeName)
  if (!theme) return

  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })

  // Get direct references to the card elements
  const englishCard = document.getElementById("english-section")
  const hebrewCard = document.getElementById("hebrew-section")

  // Add special handling for card colors in Thompson theme
  if (themeName === "thompson") {
    // Set CSS variables
    root.style.setProperty("--english-card-color", "#F2E8DC") // Light beige for English card
    root.style.setProperty("--hebrew-card-color", "#E8F4D9") // Light green for Hebrew card

    // Apply styles directly to the elements
    if (englishCard) {
      englishCard.style.backgroundColor = "#F2E8DC"
      englishCard.setAttribute("data-theme", "thompson")
    }
    if (hebrewCard) {
      hebrewCard.style.backgroundColor = "#E8F4D9"
      hebrewCard.setAttribute("data-theme", "thompson")
    }

    document.body.classList.add("thompson-theme")
    // Directly set the background color of the body
    document.body.style.backgroundColor = theme.colors.background
  } else {
    // Set CSS variables back to default
    root.style.setProperty("--english-card-color", "#D3D4D3") // Default light gray
    root.style.setProperty("--hebrew-card-color", "#F0FFF9") // Default light mint

    // Apply styles directly to the elements
    if (englishCard) {
      englishCard.style.backgroundColor = "#D3D4D3"
      englishCard.removeAttribute("data-theme")
    }
    if (hebrewCard) {
      hebrewCard.style.backgroundColor = "#F0FFF9"
      hebrewCard.removeAttribute("data-theme")
    }

    document.body.classList.remove("thompson-theme")
    // Reset to default background color
    document.body.style.backgroundColor = "#e2c4c4"
  }

  console.log(`Theme updated to ${themeName}. Card colors should be updated.`)
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize color theme
  updateColorTheme(state.colorTheme)

  // Force card colors to be set immediately
  const englishCard = document.getElementById("english-section")
  const hebrewCard = document.getElementById("hebrew-section")

  if (state.colorTheme === "thompson") {
    if (englishCard) englishCard.style.backgroundColor = "#F2E8DC"
    if (hebrewCard) hebrewCard.style.backgroundColor = "#E8F4D9"
  } else {
    if (englishCard) englishCard.style.backgroundColor = "#D3D4D3"
    if (hebrewCard) hebrewCard.style.backgroundColor = "#F0FFF9"
  }

  // Initialize audio system
  await initializeAudioSystem()

  // Rest of the initialization code...
  createMenuGrid()

  // Add the event listener to the menu button - ONLY ONCE
  const menuButton = document.getElementById("menu-button")
  if (menuButton) {
    // Remove any existing event listeners (not directly possible, but this ensures we only add one below)
    menuButton.replaceWith(menuButton.cloneNode(true))

    // Get the fresh reference and add the event listener
    const freshMenuButton = document.getElementById("menu-button")
    freshMenuButton.addEventListener("click", toggleMenuVisibility)
    console.log("Menu button event listener added")
  }

  // Add a CSS class for the full-width button to the styleSheet
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    .control-group:not(:first-child),
    main,
    footer {
        transition: opacity ${FADE_DURATION}ms ease;
    }
    
    .menu-control-container {
        display: flex;
        flex-direction: column;
        background: var(--color-quaternary);
        border-radius: 12px;
        padding: var(--spacing-standard);
        margin-bottom: var(--spacing-standard);
        width: 100%;
        min-width: 280px; /* Match minimum width of menu button */
        max-width: 100%;
        box-sizing: border-box;
        align-self: center;
    }

    .menu-grid {
        display: none;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-standard);
        padding: var(--spacing-standard);
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
    }

    .menu-grid.visible {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .lesson-container {
        display: flex;
        flex-direction: column;
        background: var(--color-quaternary);
        border-radius: 12px;
        padding: var(--spacing-standard);
        margin-bottom: var(--spacing-standard);
        width: 100%;
        min-width: 280px; /* Match minimum width of menu button */
        max-width: 100%;
        box-sizing: border-box;
    }

    .lesson-buttons-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: calc(var(--spacing-standard) / 2);
        width: 100%;
        box-sizing: border-box;
    }

    .menu-item {
        width: 100%;
        box-sizing: border-box;
    }

    /* Explicitly define the full-width-button class to span the entire width */
    .full-width-button {
        grid-column: 1 / -1 !important;
        width: 100% !important;
    }

    /* Add styles for the menu button to ensure consistent width */
    #menu-button {
        width: 100%;
        min-width: 280px;
        max-width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
    }

    /* Update media query for mobile */
    @media (max-width: 767px}) {
        .menu-control-container,
        .lesson-container,
        #menu-button {
            width: calc(100% - 2 * var(--spacing-standard));
            min-width: 280px;
            margin-left: auto;
            margin-right: auto;
        }

        .menu-grid.visible {
            width: 100%;
            padding: var(--spacing-standard);
        }

        .lesson-buttons-container {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    #english-section {
    background: #D3D4D3; /* Updated to light gray */
}

#hebrew-section {
    background: #F0FFF9; /* Updated to light mint green */
}

/* Keep the feedback buttons with their original colors */
.feedback-button.correct {
    background: var(--color-green);
}

.feedback-button.mistake {
    background: var(--color-orange);
}
`
  document.head.appendChild(styleSheet)

  const categorySelect = document.getElementById("category-select")
  if (categorySelect) {
    categorySelect.value = "sentences"
    state.currentCategory = "sentences"
    // Hide the category select initially
    categorySelect.style.display = "none"
  }

  const header = document.querySelector("header")
  if (header) {
    const chunkSelect = document.createElement("select")
    chunkSelect.id = "chunk-select"
    chunkSelect.className = "glass-select"
    // Hide the chunk select initially
    chunkSelect.style.display = "none"

    for (let size = 10; size <= 100; size += 10) {
      const option = document.createElement("option")
      option.value = size
      option.text = `${size} words per chunk`
      if (size === state.chunkSize) option.selected = true
      chunkSelect.appendChild(option)
    }

    const chunkControlGroup = document.createElement("div")
    chunkControlGroup.className = "control-group"
    chunkControlGroup.appendChild(chunkSelect)

    const directionButton = document.getElementById("switch-direction")
    const categoryControlGroup = document.querySelector(".control-group")
    if (directionButton && categoryControlGroup) {
      directionButton.parentNode.insertBefore(chunkControlGroup, directionButton)
    }
  }

  const footerElement = document.querySelector("footer")
  if (footerElement) {
    const progressDisplay = document.createElement("div")
    progressDisplay.id = "progress-display"
    progressDisplay.style.textAlign = "center"
    progressDisplay.style.marginTop = "8px"
    progressDisplay.style.color = "#333"
    footerElement.appendChild(progressDisplay)
  }

  createFeedbackButtons()
  loadData(state.currentCategory)
  initializeEventListeners()
})

const initializeEventListeners = () => {
  const categorySelect = document.getElementById("category-select")
  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      state.currentCategory = this.value
      state.isRevealed = false
      state.completedChunkIndices.clear()
      toggleFeedbackButtons(false)
      loadData(state.currentCategory)
    })
  }

  const chunkSelect = document.getElementById("chunk-select")
  if (chunkSelect) {
    chunkSelect.addEventListener("change", function () {
      state.chunkSize = Number.parseInt(this.value)
      state.completedChunkIndices.clear()
      filterDataByLesson()
      initializeRandomization()
      updateUI()
    })
  }

  const directionButton = document.getElementById("switch-direction")
  if (directionButton) {
    directionButton.addEventListener("click", function () {
      state.isEnglishToHebrew = !state.isEnglishToHebrew
      const buttonText = this.querySelector(".button-text")
      if (buttonText) {
        buttonText.innerText = state.isEnglishToHebrew ? "English → Hebrew" : "Hebrew → English"
      }
      updateUI()
    })
  }

  const showButton = document.getElementById("show-continue")
  if (showButton) {
    showButton.addEventListener("click", () => {
      if (!state.isRevealed) {
        if (state.isEnglishToHebrew) {
          showHebrew()
        } else {
          showEnglish()
        }
        state.isRevealed = true
        toggleFeedbackButtons(true)
      }
    })
  }
}

const loadData = async (category) => {
  try {
    const response = await fetch(`input_data/${category}.json`)
    state.data = await response.json()

    // Filter data by current lesson
    filterDataByLesson()

    // Initialize randomization with filtered data
    initializeRandomization()
    updateUI()
  } catch (error) {
    console.error("Error loading data:", error)
    // For testing purposes, create some dummy data if fetch fails
    state.data = [
      { english: "Hello", hebrew_spoken: "Shalom", hebrew_letters: "שלום", lesson: 1 },
      { english: "Goodbye", hebrew_spoken: "Lehitraot", hebrew_letters: "להתראות", lesson: 1 },
      { english: "Thank you", hebrew_spoken: "Toda", hebrew_letters: "תודה", lesson: 1 },
      { english: "How are you?", hebrew_spoken: "Ma shlomcha?", hebrew_letters: "מה שלומך?", lesson: 2 },
      { english: "I'm fine", hebrew_spoken: "Ani beseder", hebrew_letters: "אני בסדר", lesson: 2 },
      { english: "What's your name?", hebrew_spoken: "Eich korim lecha?", hebrew_letters: "איך קוראים לך?", lesson: 3 },
    ]

    // Filter data by current lesson
    filterDataByLesson()

    // Initialize randomization with filtered data
    initializeRandomization()
    updateUI()
  }
}

const showHebrew = () => {
  const hebrewDiv = document.getElementById("hebrew-content")
  if (!hebrewDiv) return

  const content = formatHebrewContent(state.filteredData[state.remainingIndices[state.currentIndex]])
  fadeOut(hebrewDiv)
  setTimeout(() => {
    hebrewDiv.innerHTML = content
    fadeIn(hebrewDiv)
  }, FADE_DURATION)
}

const showEnglish = () => {
  const englishDiv = document.getElementById("english-text")
  if (!englishDiv) return

  const content = state.filteredData[state.remainingIndices[state.currentIndex]].english
  fadeOut(englishDiv)
  setTimeout(() => {
    englishDiv.innerHTML = content
    fadeIn(englishDiv)
  }, FADE_DURATION)
}

const formatHebrewContent = (entry) => {
  const templates = {
    sentences: () => `
            <div class="hebrew-text">
                <p class="spoken">${entry.hebrew_spoken}</p>
                <p class="letters">${entry.hebrew_letters}</p>
            </div>`,
    nouns: () => `
            <div class="hebrew-text">
                <div class="form-group">
                    <span class="label">Singular:</span>
                    <span class="spoken">${entry.hebrew_spoken_singular}</span>
                    <span class="letters">(${entry.hebrew_letters_singular})</span>
                </div>
                <div class="form-group">
                    <span class="label">Plural:</span>
                    <span class="spoken">${entry.hebrew_spoken_plural}</span>
                    <span class="letters">(${entry.hebrew_letters_plural})</span>
                </div>
            </div>`,
    verbs: () => `
            <div class="hebrew-text">
                <div class="form-group">
                    <span class="label">General:</span>
                    <span class="spoken">${entry.hebrew_spoken_general}</span>
                    <span class="letters">(${entry.hebrew_letters_general})</span>
                </div>
                <div class="form-group">
                    <span class="label">He:</span>
                    <span class="spoken">${entry.hebrew_spoken_he}</span>
                    <span class="letters">(${entry.hebrew_letters_he})</span>
                </div>
                <div class="form-group">
                    <span class="label">She:</span>
                    <span class="spoken">${entry.hebrew_spoken_she}</span>
                    <span class="letters">(${entry.hebrew_letters_she})</span>
                </div>
            </div>`,
    adjectives: () => `
            <div class="hebrew-text">
                <div class="form-group">
                    <span class="label">Male:</span>
                    <span class="spoken">${entry.hebrew_spoken_male}</span>
                    <span class="letters">(${entry.hebrew_letters_male})</span>
                </div>
                <div class="form-group">
                    <span class="label">Female:</span>
                    <span class="spoken">${entry.hebrew_spoken_female}</span>
                    <span class="letters">(${entry.hebrew_letters_female})
                </div>
            </div>`,
  }

  return templates[state.currentCategory]?.() || ""
}

