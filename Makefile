BUILD = ./build
NAME = thintabs@bonsaimind.org
SRC = ./src

all: $(BUILD)/$(NAME).xpi

$(BUILD)/$(NAME).xpi:
	mkdir --parent $(BUILD)
	zip -j $@ $(SRC)/*
	
clean:
	$(RM) $(BUILD)/$(NAME).xpi
	$(RM) -R $(BUILD)

