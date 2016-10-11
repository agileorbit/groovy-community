@Grapes([
        @Grab('io.ratpack:ratpack-groovy:1.4.2'),
        @Grab('org.slf4j:slf4j-simple:1.7.21')
])
import static ratpack.groovy.Groovy.ratpack

ratpack {
  handlers {
    files {
      dir("public").indexFiles("index.html")
    }
  }
}
