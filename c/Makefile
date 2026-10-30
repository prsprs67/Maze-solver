# Makefile for MazeVerse C Data Structures Project

CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
EMCC = emcc
EMCC_FLAGS = -O3 -s WASM=1 -s STANDALONE_WASM=1 --no-entry

C_SOURCES = c/maze.c c/queue.c c/stack.c c/bfs.c c/dfs.c
WASM_SOURCES = $(C_SOURCES) c/wasm_bridge.c
TARGET_CLI = maze_cli
TARGET_WASM = public/wasm/maze.wasm

all: $(TARGET_CLI)

$(TARGET_CLI): $(C_SOURCES) c/main.c
	$(CC) $(CFLAGS) -I c $(C_SOURCES) c/main.c -o $(TARGET_CLI)
	@echo "Built $(TARGET_CLI) successfully."

wasm: $(TARGET_WASM)

$(TARGET_WASM): $(WASM_SOURCES)
	@mkdir -p public/wasm
	$(EMCC) $(EMCC_FLAGS) -I c $(WASM_SOURCES) -o $(TARGET_WASM)
	@echo "Compiled WebAssembly module to $(TARGET_WASM)."

clean:
	rm -f $(TARGET_CLI) $(TARGET_WASM)

.PHONY: all wasm clean
