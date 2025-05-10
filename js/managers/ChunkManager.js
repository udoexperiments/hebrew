// js/managers/ChunkManager.js
import StateManager from './StateManager.js';
import { shuffleArray } from '../utils/helpers.js';

class ChunkManager {
  initializeRandomization() {
    const filteredData = StateManager.get('filteredData');
    const masterIndices = shuffleArray([...Array(filteredData.length).keys()]);
    StateManager.set('masterIndices', masterIndices);
    this.initializeNewChunk();
  }

  initializeNewChunk() {
    const masterIndices = StateManager.get('masterIndices');
    const completedChunkIndices = StateManager.get('completedChunkIndices');
    const chunkSize = StateManager.get('chunkSize');
    
    const availableIndices = masterIndices.filter(
      (i) => !completedChunkIndices.has(i)
    );

    if (availableIndices.length === 0) {
      StateManager.update({
        completedChunkIndices: new Set(),
        currentChunkIndices: masterIndices.slice(0, Math.min(chunkSize, masterIndices.length))
      });
    } else {
      StateManager.set(
        'currentChunkIndices',
        availableIndices.slice(0, Math.min(chunkSize, availableIndices.length))
      );
    }

    const currentChunkIndices = StateManager.get('currentChunkIndices');
    StateManager.update({
      remainingIndices: [...currentChunkIndices],
      currentIndex: 0,
      completedItems: 0
    });
    
    // Don't update UI here - let the caller handle it
  }

  handleItemComplete(wasCorrect) {
    const currentChunkIndices = StateManager.get('currentChunkIndices');
    const remainingIndices = StateManager.get('remainingIndices');
    const currentIndex = StateManager.get('currentIndex');
    const completedItems = StateManager.get('completedItems');
    
    const currentValue = remainingIndices[currentIndex];

    if (wasCorrect) {
      StateManager.set('completedItems', completedItems + 1);
      const newRemainingIndices = remainingIndices.filter((_, index) => index !== currentIndex);
      StateManager.set('remainingIndices', newRemainingIndices);

      // Check if this was the last item in the chunk
      if (newRemainingIndices.length === 0) {
        const completedChunkIndices = StateManager.get('completedChunkIndices');
        currentChunkIndices.forEach(i => completedChunkIndices.add(i));
        StateManager.set('completedChunkIndices', completedChunkIndices);
        return 'chunk_complete';
      } else {
        // Select new random index
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * newRemainingIndices.length);
        } while (newRemainingIndices[newIndex] === currentValue && newRemainingIndices.length > 1);
        StateManager.set('currentIndex', newIndex);
        return 'continue';
      }
    } else {
      // Handle mistake - move to later in the queue
      const newRemainingIndices = [...remainingIndices];
      newRemainingIndices.splice(currentIndex, 1);
      const newPosition = Math.floor(Math.random() * (newRemainingIndices.length - 1)) + 1;
      newRemainingIndices.splice(newPosition, 0, currentValue);
      StateManager.set('remainingIndices', newRemainingIndices);

      // Select new random index
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * newRemainingIndices.length);
      } while (newRemainingIndices[newIndex] === currentValue && newRemainingIndices.length > 1);

      StateManager.set('currentIndex', newIndex);
      return 'continue';
    }
  }
}

export default new ChunkManager();