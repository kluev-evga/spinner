class Spinner {
   constructor(element, options) {
      // <div.container>
      //     <div.base>
      //         <div.axis>
      //              <div..........fasets>
      this.links = [...element.children]
      this.options = this.calcOptions(options)

      this.spinnerContainer = this.createSpinnerContainer(element)
      this.spinnerBase = this.createSpinnerBase()
      this.spinnerAxis = this.createSpinnerAxis()

      this.createFacets()
      this.addScroll()

      this.angle = 0

      if (this.options.addScrollOnKeyboard) this.addScrollOnKeyboard()
   }

   invert(one, two) {
      return [one, two].reverse()
   }

   // setup options:
   // ======================================================================
   calcOptions(options) {
      options.height = typeof options.height === 'number' ? options.height : 100
      options.linkWidth =
         typeof options.linkWidth === 'number' ? options.linkWidth : 20

      options.spinnerLinkClass =
         typeof options.spinnerLinkClass === 'string'
            ? options.spinnerLinkClass
            : 'spinner__link'
      options.spinnerLinkClass =
         options.spinnerLinkClass.indexOf('.') === 0
            ? options.spinnerLinkClass.slice(1)
            : options.spinnerLinkClass

      options.linksCount = this.links.length >= 3 ? this.links.length : 3

      options.step = 360 / options.linksCount

      options.orientation = options.orientation === 'landscape' ? 'Y' : 'X'

      options.gap =
         options.gap > -1 && typeof options.gap === 'number' ? options.gap : -1

      // calc spinner radius:
      options.diameter =
         options.height *
         (0.99 -
            (1 / options.perspective ** 2) * 28000 -
            (1 / options.linksCount ** 2) * 3.6)

      // calc spinner link height:
      options.linkHeight =
         Math.round(Math.tan(Math.PI / options.linksCount) * options.diameter) -
         options.gap

      if (options.orientation === 'Y')
         [options.linkHeight, options.linkWidth] = this.invert(
            options.linkHeight,
            options.linkWidth
         )

      options.perspective =
         typeof options.perspective === 'number' ? options.perspective : 1500

      options.counterStart =
         typeof options.counterStart === 'number' ? options.counterStart : 1

      return options
   } // ------------------------------------------------end of setup options

   // Create spinner "body":
   // ======================================================================
   createSpinnerContainer(element) {
      element.style.cssText = `height: ${this.options.height}px;
                                 width: 600px;
                                 display: flex;
                                 align-items: center;
                                 justify-content: center;
                                 cursor:grab;
                                 overflow: hidden;
                                 touch-action: none`
      return element
   }

   createSpinnerBase() {
      const spinnerBase = document.createElement('div')
      spinnerBase.classList.add('spinner__base')
      spinnerBase.style.cssText = `width: ${this.options.linkWidth}px;
                                     height: ${this.options.linkHeight}px;
                                     transform-style: preserve-3d;
                                     perspective: ${this.options.perspective}px;
                                     transform: rotateY(${this.options.angle}deg)`
      this.spinnerContainer.append(spinnerBase)
      return spinnerBase
   }

   createSpinnerAxis() {
      const spinnerAxis = document.createElement('div')
      spinnerAxis.classList.add('spinner__axis')
      spinnerAxis.style.cssText = `transform-style:preserve-3d;
                                     width: 100%;
                                     height: 100%;
                                     transform: rotateX(0);
                                     transition-duration: 0.1s;
                                     transition-property: transform
                                     transition-timing-function: ease-in-out`
      this.spinnerBase.append(spinnerAxis)
      return spinnerAxis
   }

   createFacets() {
      const spinner = this,
         content = spinner.links,
         step = spinner.options.step,
         spinnerLinkClass = spinner.options.spinnerLinkClass,
         reverseContent = spinner.options.reverseContent,
         axis = spinner.spinnerAxis,
         linksCount = spinner.options.linksCount,
         radius = spinner.options.diameter / 2,
         orientation = spinner.options.orientation

      let angleOfRotation = 0

      function calcNextAngle() {
         reverseContent ? (angleOfRotation += step) : (angleOfRotation -= step)
      }

      for (let i = 0; i < linksCount; i++) {
         const facet = document.createElement('div')
         facet.classList.add(spinnerLinkClass)
         facet.append(content[i])
         facet.style.cssText = `position: absolute;
                                   width: 100%;
                                   height: 100%;
                                   transform: rotate${orientation}(${angleOfRotation}deg) translateZ(${radius}px);
                                   user-select:none;`

         facet.addEventListener('dragstart', e => {
            e.preventDefault()
         })

         calcNextAngle()
         axis.append(facet)
      }
   } //  ---------------------------------------end of create spinner "body"

   // add grab & scroll // animation // kinetic:
   // ======================================================================
   addScroll() {
      const spinner = this,
         options = spinner.options,
         container = spinner.spinnerContainer,
         axis = spinner.spinnerAxis,
         links = spinner.links,
         step = spinner.options.step,
         orientation = spinner.options.orientation,
         modifier = (1 / Math.cbrt(step)) * 0.8

      let startTime, currentPos, zeroPos

      const onMouseDown = function (e) {
         cancelAnimationFrame(this.animateId)

         container.style.cursor = 'grabbing'
         container.setPointerCapture(e.pointerId)

         container.addEventListener('pointermove', onMouseDrag, {
            capture: true,
            passive: true,
         })

         currentPos = this.angle

         zeroPos = orientation === 'Y' ? e.clientX : e.clientY

         // kinetic start time:
         startTime = Date.now()
      }.bind(this)

      const onMouseDrag = function (e) {
         let shift =
            orientation === 'Y' ? e.clientX - zeroPos : zeroPos - e.clientY
         this.angle = currentPos + shift * modifier
         axis.style.transform = `rotate${orientation}(${this.angle}deg)`
      }.bind(this)

      const onMouseUp = function (e) {
         this.spinnerContainer.style.cursor = 'grab'
         this.spinnerContainer.removeEventListener('pointermove', onMouseDrag, {
            capture: true,
            passive: true,
         })

         // kinetic:
         const dragDuration = Date.now() - startTime
         const dragDistance =
            orientation === 'Y' ? e.clientX - zeroPos : zeroPos - e.clientY
         const impulse = dragDistance / dragDuration

         // kinetic - animation duration:
         let duration = Math.sqrt(Math.abs(impulse)) * 400 + 100
         // kinetic - animation distance:
         const d = impulse * 30

         const currentPos = this.angle

         // stopAt = increment...(angle)
         let stopAt = 0

         if (Math.abs(d) < step / 2) {
            stopAt = -currentPos % step
            duration = duration * 1.6
         } else {
            stopAt = d - ((currentPos + d) % step)
         }

         // run slip animation:
         this.animate.call(this, duration, stopAt, currentPos)
      }.bind(this)

      container.addEventListener('pointerdown', onMouseDown, {
         capture: true,
         passive: true,
      })
      container.addEventListener('pointerup', onMouseUp, {
         capture: true,
         passive: true,
      })

      // After animation correction on zero(drop down axis rotate degree below 360 - prevent "swirl to infinity"):
      axis.addEventListener('transitionend', () => {
         let currentPos = parseFloat(axis.style.transform.slice(8))
         let a = Math.abs(currentPos / 360)
         if (a > 1) {
            axis.style.transitionDuration = ''

            function dropDown() {
               currentPos > 0 ? (currentPos -= 360) : (currentPos += 360)
               if (Math.abs(currentPos) > 360) dropDown()
               return currentPos
            }

            axis.style.transform = `rotate${orientation}(${dropDown()}deg)`

            setTimeout(() => {
               axis.style.transitionDuration = '0.1s'
            })
         }
      })

      /////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////
      /////////////////////////////////////////////////////////////////////////////////////////////

      let wheel = 0
      container.addEventListener('mousewheel', e => {
         e.preventDefault()

         let delta = e.wheelDelta

         if (Math.abs(delta) < 100) {
            wheel += delta
         }
         wheel = delta
         if (Math.abs(wheel) < 100) return
         wheel = 0

         currentPos = parseFloat(axis.style.transform.slice(8))
         let newPos = delta < 0 ? currentPos - step : currentPos + step
         axis.style.transform = `rotate${options.orientation}(${newPos}deg)`
         // console.log("deltaY", e.deltaY, "wheelDeltaY", e.wheelDeltaY, "wheelDelta", e.wheelDelta);
      })
   } //  ------------------------------------------------end add scroll

   animate(duration, stopAt, currentPos) {
      const start = performance.now()

      const animate = function (time) {
         let timeFraction = (time - start) / duration
         if (timeFraction > 1) timeFraction = 1

         // animation timing function:
         let progress = Math.sqrt(timeFraction)

         this.angle = currentPos + progress * stopAt

         this.spinnerAxis.style.transform = `rotate${this.options.orientation}(${this.angle}deg)`

         if (timeFraction < 1) requestAnimationFrame(animate)
      }.bind(this)

      this.animateId = requestAnimationFrame(animate)
   }

   addScrollOnKeyboard() {
      const spinner = this
      const container = spinner.spinnerContainer
      const axis = spinner.spinnerAxis
      const orientation = spinner.options.orientation
      const step = spinner.options.step

      let keyCodeForward =
         spinner.options.orientation === 'Y' ? 'ArrowRight' : 'ArrowUp'
      let keyCodeBackward =
         spinner.options.orientation === 'Y' ? 'ArrowLeft' : 'ArrowDown'

      if (spinner.options.reverseControls) {
         ; ({ keyCodeForward, keyCodeBackward } = {
            keyCodeForward: keyCodeBackward,
            keyCodeBackward: keyCodeForward,
         })
      }

      function onKeyBoard(e) {
         if (e.code === keyCodeForward) {
            e.preventDefault()
            let currentPos = parseFloat(axis.style.transform.slice(8))
            axis.style.transform = `rotate${orientation}(${currentPos + step
               }deg)`
         }
         if (e.code === keyCodeBackward) {
            e.preventDefault()
            let currentPos = parseFloat(axis.style.transform.slice(8))
            axis.style.transform = `rotate${orientation}(${currentPos - step
               }deg)`
         }
      }

      let keyboard

      document.addEventListener('keydown', e => {
         if (keyboard) onKeyBoard(e)
      })

      const io = new IntersectionObserver(
         (entries, observer) => {
            if (entries[0].intersectionRatio > 0.9) keyboard = true
            if (entries[0].intersectionRatio < 0.9) keyboard = false
         },
         {
            threshold: [0, 0.95],
            margin: 50,
         }
      )
      io.observe(container)
   }
}