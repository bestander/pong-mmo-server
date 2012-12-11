install:
	npm install

clean:
	rm -rf ./node_modules

run-test:
	./node_modules/.bin/jasmine-node test --verbose --forceexit

.PHONY: clean



