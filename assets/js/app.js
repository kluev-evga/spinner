let sp = document.querySelector('.spinner')
const spinner = new Spinner(sp, {
   // ------------------------------spinnerLinkClass: (default "spinner__link"),
   spinnerLinkClass: 'spinner__link',
   // ------------------------------spinner height(default 100):
   height: 700,
   // ------------------------------spinner links width(default 20):
   linkWidth: 250,
   // ------------------------------gaps between spinner links -1(default) -1.... infinity (do not use too much)
   gap: 10,
   // ------------------------------spinner perspective"bloating"(1500 default):
   perspective: 1500,
   // ------------------------------tilt spinner(0 degree default):
   angle: 6,
   // ------------------------------"landscape"/("portrait" default):
   // orientation: "landscape",
   // ------------------------------fill spinner with text content(no content = fill with numbers):

   // ------------------------------start counter from digit(1 default):
   counterStart: 1,
   // ------------------------------reverse content counter clock wise(false default):
   // reverseContent: true,

   addScrollOnKeyboard: true,
   // reverseControls: true,
})

console.log(spinner)

const sp1 = document.querySelector('.spinner1')
function createContent(count) {
   let fragment = new DocumentFragment()

   for (let i = 1; i <= count; i++) {
      let div = document.createElement('div')
      div.innerText = i
      fragment.append(div)
   }

   return fragment
}

sp1.append(createContent(30))
new Spinner(sp1, {
   // ------------------------------spinnerLinkClass: (default "spinner__link"),
   spinnerLinkClass: 'spinner__link',
   // ------------------------------spinner height(default 100):
   height: 300,
   // ------------------------------spinner links width(default 20):
   linkWidth: 80,
   // ------------------------------gaps between spinner links -1(default) -1.... infinity (do not use too much)
   gap: 1,
   // ------------------------------spinner perspective"bloating"(1500 default):
   perspective: 1500,
   // ------------------------------tilt spinner(0 degree default):
   angle: 5,
   // ------------------------------"landscape"/("portrait" default):
   orientation: 'landscape',
   // ------------------------------fill spinner with text content(no content = fill with numbers):

   // ------------------------------start counter from digit(1 default):
   // counterStart: 1,
   // ------------------------------reverse content counter clock wise(false default):
   reverseContent: true,

   // addScrollOnKeyboard: true,
   // reverseControls: true,
})

const sp2 = document.querySelector('.spinner2')
sp2.append(createContent(200))

sp2.append(createContent())
new Spinner(sp2, {
   // ------------------------------spinnerLinkClass: (default "spinner__link"),
   spinnerLinkClass: 'spinner__link',
   // ------------------------------spinner height(default 100):
   height: 700,
   // ------------------------------spinner links width(default 20):
   linkWidth: 30,
   // ------------------------------gaps between spinner links -1(default) -1.... infinity (do not use too much)
   gap: 0,
   // ------------------------------spinner perspective"bloating"(1500 default):
   perspective: 700,
   // ------------------------------tilt spinner(0 degree default):
   angle: 0,
   // ------------------------------"landscape"/("portrait" default):
   // orientation: 'landscape',
   // ------------------------------fill spinner with text content(no content = fill with numbers):

   // ------------------------------start counter from digit(1 default):
   counterStart: 1,
   // ------------------------------reverse content counter clock wise(false default):
   // reverseContent: true,

   // addScrollOnKeyboard: true,
   // reverseControls: true,
})
