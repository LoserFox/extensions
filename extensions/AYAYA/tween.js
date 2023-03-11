(function(Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
      throw new Error('tween must run unsandboxed');
    }
  
    class Tween {
      getInfo() {
        return {
          id: 'helloworldunsandboxed',
          name: 'Unsandboxed Hello World',
          blocks: [
            {
              opcode: 'hello',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Hello!'
            }
          ]
        };
      }
      hello() {
        return 'World!';
      }
    }
    Scratch.extensions.register(new Tween());
  })(Scratch);
  