@Grab('io.ratpack:ratpack-groovy:1.3.3')

import static ratpack.groovy.Groovy.ratpack

ratpack {
  handlers {
    files {
      dir("public").indexFiles("index.html")
    }
  }
}
