build: src/img/*.jpg src/js/*.js src/index.html
	mkdir -p build/js && \
	mkdir -p build/img && \
	cp src/img/*.jpg build/img && \
	cp src/js/*.js build/js && \
	cp src/index.html build


.PHONY: clean
clean:
	rm -rf build
