BUILD_DIR = build
INSTALL_DIR = dist
TARGET = visu
BINARY_PATH = $(CURDIR)/$(INSTALL_DIR)/bin/$(TARGET)

.PHONY: all setup build run clean format format-check bear debug whodoyouthinkyouareiam

all: install

setup:
	@if [ ! -d "$(BUILD_DIR)/meson-private" ]; then \
		echo "CLEARING BUILD AND REFRESHING SUBPROJECTS..."; \
		rm -rf $(BUILD_DIR); \
		meson setup $(BUILD_DIR) \
		--wrap-mode=forcefallback \
		--prefix=$(CURDIR)/$(INSTALL_DIR) \
		--reconfigure; \
	fi

install: build
	meson install -C $(BUILD_DIR)

build: setup
	meson compile -C $(BUILD_DIR)

run:
	@if [ ! -f $(BINARY_PATH) ]; then \
		echo "BINARY NOT FOUND, BUILDING FIRST..."; \
		$(MAKE) build; \
		$(MAKE) install; \
	fi
	$(BINARY_PATH)

clean:
	rm -rf $(BUILD_DIR)
	rm -rf $(INSTALL_DIR)

TARGET_SPACERS = src/mr_utils/build/release/spacers

$(TARGET_SPACERS):
	$(MAKE) -C src/mr_utils spacers

format: $(TARGET_SPACERS)
	find . \( -path "./build" -o -path "./subprojects" \) -prune -o -name "*.c" -o -name "*.h" -print | xargs clang-format -i --verbose
	git ls-files | xargs ./$(TARGET_SPACERS)

format-check:
	find ./src -name '*.h' -o -name '*.c' | xargs clang-format --dry-run --Werror --verbose

bear:
	@if [ ! -d $(BUILD_DIR)/meson-private ]; then $(MAKE) setup; fi
	ln -sf $(BUILD_DIR)/compile_commands.json .

debug: setup
	meson configure $(BUILD_DIR) -Dbuildtype=debug
	$(MAKE) build

valgrind:
	valgrind --leak-check=full --suppressions=valgrind.supp $(BINARY_PATH)

record:
	perf record -g --call-graph dwarf $(BINARY_PATH)
	perf script > chombo.perf

whodoyouthinkyouareiam: clean setup build run
