/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

class MergeDuplicateChunksPlugin {

	apply(compiler) {
		compiler.plugin("compilation", (compilation) => {
			compilation.plugin("optimize-chunks-basic", (chunks) => {
				const notDuplicates = new Set();
				for(let i = 0; i < chunks.length; i++) {
					const chunk = chunks[i];
					let possibleDuplicates;
					for(const module of chunk.modulesIterable) {
						if(possibleDuplicates === undefined) {
							possibleDuplicates = new Set();
							for(const dup of module.chunksIterable) {
								if(!notDuplicates.has(dup) && dup !== chunk)
									possibleDuplicates.add(dup);
							}
						} else {
							for(const dup of possibleDuplicates) {
								if(!module.isInChunk(dup))
									possibleDuplicates.delete(dup);
							}
						}
						if(possibleDuplicates.size === 0) break;
					}
					if(possibleDuplicates !== undefined && possibleDuplicates.size > 0) {
						for(const otherChunk of possibleDuplicates) {
							if(chunk.integrate(otherChunk, "duplicate"))
								chunks.splice(chunks.indexOf(otherChunk), 1);
						}
					}
					notDuplicates.add(chunk);
				}
			});
		});
	}
}
module.exports = MergeDuplicateChunksPlugin;
