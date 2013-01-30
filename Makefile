install:
	npm install

clean:
	rm -rf ./node_modules

test:
	./node_modules/.bin/jasmine-node test --verbose --forceexit

.PHONY: clean test 




