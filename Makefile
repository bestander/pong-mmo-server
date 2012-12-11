install-demo:
	./node_modules/.bin/component install --dev
	./node_modules/.bin/component build --dev

clean-demo:
	rm -rf ./components ./build

clean:
	rm -rf ./node_modules

test:
	./node_modules/.bin/jasmine-node test --verbose

.PHONY: clean



