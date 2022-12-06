import SwipeListener from "swipe-listener";

class SectionNavigator {
  stepId = "0";
  offset = 0;
  transitionInProgress = false;
  transitionDuration = 1500;
  main = document.querySelector("main");
  steps = document.querySelector(".steps");
  currentStep = document.querySelector(`#step-${this.stepId}`);
  tree = [];
  stepsId = ["0"];
  parcoursId = 1;

  constructor() {
    setTimeout(() => {
      this.showCurrentStep();
    }, 50);
    this.listenKeyboard();
    this.listenMouseWheel();
    this.listenSwipe();
    window.addEventListener("resize", this.onResize.bind(this));
    this.onResize();
    this.loadTree();
    document.querySelector(".debug-go").addEventListener("click", () => {
      this.navigateToStep(document.querySelector(".debug-step").value);
    });
  }

  loadTree() {
    fetch("json/tree.json?v1.2").then((response) => {
      response.json().then((tree) => {
        this.tree = tree.tree;
        this.initCurrentStep();
      });
    });
  }

  listenKeyboard() {
    document.addEventListener("keyup", (key) => {
      const keyname = key.key;
      switch (keyname) {
        case "ArrowDown":
        case "ArrowRight":
          this.navigateToNextStep("Keyboard");
          break;
        case "ArrowUp":
        case "ArrowLeft":
          this.navigateToPreviousStep("Keyboard");
          break;
      }
    });
  }

  listenMouseWheel() {
    window.addEventListener("wheel", (event) => {
      const delta = Math.sign(event.deltaY);
      if (delta > 0) this.navigateToNextStep("Wheel");
      if (delta < 0) this.navigateToPreviousStep("Wheel");
    });
  }

  listenSwipe() {
    SwipeListener(this.main);
    this.main.addEventListener("swipe", (e) => {
      if (e.detail.directions.top) this.navigateToNextStep("Swipe");
      if (e.detail.directions.bottom) this.navigateToPreviousStep("Swipe");
    });
  }

  addInsecableSpaces(string) {
    const space = "&nbsp;";
    return string
      .replaceAll(" + ", `${space}+${space}`)
      .replaceAll(" ?", `${space}?`)
      .replaceAll(" !", `${space}!`)
      .replaceAll(" :", `${space}:`);
  }

  constructStepIntermediate(fromPath) {
    const template = document.querySelector(".step-intermediate-tpl");
    const stepIntermediate = document.importNode(template.content, true);
    const section = stepIntermediate.querySelector("section");
    section.setAttribute("data-from-path", fromPath);
    const id = `intermediate-${this.stepsId.length}`;
    section.setAttribute("id", id);
    this.currentStep.after(section);
    this.stepsId.push(id);
  }

  getLabelLength(label) {
    return Math.min(Math.round(label.length / 20), 3);
  }

  constructStep(data) {
    if (!data.paths) data.paths = [];
    const template = document.querySelector(".step-tpl");
    const step = document.importNode(template.content, true);
    const section = step.querySelector("section");
    const article = section.querySelector("article");
    const zoneLeft = step.querySelector(".zone-left");
    const zoneRight = step.querySelector(".zone-right");
    const buttonCenter = step.querySelector(".button-center");
    const buttonLeft = step.querySelector(".button-left");
    const buttonRight = step.querySelector(".button-right");
    const buttonArrow = step.querySelector(".button-arrow");
    section.setAttribute("id", `step-${data.id}`);
    section.setAttribute("data-path", data.paths.length);
    step.querySelector("h2").innerHTML = this.addInsecableSpaces(
      data.title || ""
    );
    if (data.title.length < 40)
      step.querySelector("h2").classList.add("short-title");
    if (data.image) {
      const img = document.createElement("img");
      img.src = data.image;
      step.querySelector("h2").after(img);
      article.classList.add("has-image");
    }
    if (data.video) {
      const iframe = document.createElement("iframe");
      iframe.src = `./video/${data.video}.html`;
      iframe.setAttribute("data-src", iframe.src);
      iframe.setAttribute("frameborder", 0);
      iframe.setAttribute("allowfullscreen", true);
      step.querySelector("h2").after(iframe);
      article.classList.add("has-video");
      article.classList.add(`video-${data.video}`);
    }

    if (data.paths.length === 0) {
      buttonCenter.remove();
    }
    if (data.paths.length <= 1) {
      step.querySelector(".path-left").remove();
      step.querySelector(".path-right").remove();
      zoneLeft.remove();
      zoneRight.remove();
    }
    if (data.paths.length === 1) {
      if (!data.paths[0].label) {
        buttonCenter.remove();
        buttonArrow.setAttribute("data-target", data.paths[0].step);
      } else {
        buttonCenter.setAttribute("data-target", data.paths[0].step);
        buttonCenter.innerHTML = this.addInsecableSpaces(data.paths[0].label);
        buttonCenter.setAttribute(
          "data-label-length",
          this.getLabelLength(data.paths[0].label)
        );
        buttonArrow.remove();
      }
    } else {
      buttonArrow.remove();
    }
    const pathIndexButtonLeft = 0;
    const pathIndexButtonRight = data.paths.length === 2 ? 1 : 2;
    if (data.paths.length >= 2) {
      buttonLeft.innerHTML = this.addInsecableSpaces(
        data.paths[pathIndexButtonLeft].label
      );
      buttonLeft.setAttribute(
        "data-target",
        data.paths[pathIndexButtonLeft].step
      );
      buttonLeft.setAttribute(
        "data-label-length",
        this.getLabelLength(data.paths[pathIndexButtonLeft].label)
      );
      buttonRight.innerHTML = this.addInsecableSpaces(
        data.paths[pathIndexButtonRight].label
      );
      buttonRight.setAttribute(
        "data-target",
        data.paths[pathIndexButtonRight].step
      );
      buttonRight.setAttribute(
        "data-label-length",
        this.getLabelLength(data.paths[pathIndexButtonRight].label)
      );
    }

    if (data.paths.length === 2) {
      buttonCenter.remove();
      buttonLeft.setAttribute("data-from-path", "2a");
      buttonRight.setAttribute("data-from-path", "2b");
    }
    if (data.paths.length === 3) {
      const pathIndexButtonCenter = 1;
      buttonCenter.innerHTML = this.addInsecableSpaces(
        data.paths[pathIndexButtonCenter].label
      );
      buttonCenter.setAttribute(
        "data-target",
        data.paths[pathIndexButtonCenter].step
      );
      buttonCenter.setAttribute(
        "data-label-length",
        Math.round(data.paths[pathIndexButtonCenter].label.length / 50)
      );
      buttonLeft.setAttribute("data-from-path", "3a");
      buttonCenter.setAttribute("data-from-path", "3b");
      buttonRight.setAttribute("data-from-path", "3c");
    }
    document.querySelector(".steps").appendChild(step);
  }

  initCurrentStep() {
    Array.prototype.slice
      .call(this.currentStep.getElementsByTagName("button"))
      .map((button) => {
        button.addEventListener("click", () => {
          const target = button.getAttribute("data-target");
          const fromPath = button.getAttribute("data-from-path");
          if (fromPath) this.constructStepIntermediate(fromPath);
          if (this.currentStep.querySelector("iframe"))
            this.currentStep.querySelector("iframe").setAttribute("src", "");
          this.navigateToStep(target);
        });
      });
  }

  hideCurrentStep() {
    this.currentStep.classList.remove("show");
  }
  showCurrentStep() {
    this.currentStep.classList.add("show");
    if (this.currentStep.querySelector("iframe"))
      this.currentStep
        .querySelector("iframe")
        .setAttribute(
          "src",
          this.currentStep.querySelector("iframe").getAttribute("data-src")
        );
  }

  navigateToNextStep() {
    if (this.transitionInProgress) return;
    if (this.currentStep.getElementsByTagName("button").length === 1) {
      this.currentStep.getElementsByTagName("button")[0].click();
    }
  }

  getStepIdBySection(step) {
    return step.getAttribute("id").split("step-")[1];
  }

  navigateToPreviousStep() {
    if (this.transitionInProgress) return;
    const currentIndex = this.stepsId.indexOf(this.stepId);
    if (currentIndex > 0) {
      let previousStep =
        this.steps.querySelectorAll("section")[currentIndex - 1];
      if (previousStep.getAttribute("data-from-path")) {
        previousStep = this.steps.querySelectorAll("section")[currentIndex - 2];
      }
      this.navigateToStep(this.getStepIdBySection(previousStep));
    }
  }

  getStepById(stepId) {
    return this.tree.find((step) => String(step.id) === stepId);
  }

  getParcoursByStepId(stepId) {
    return Math.ceil((Number(stepId) + 1) / 100);
  }

  navigateToStep(stepId) {
    if (this.transitionInProgress) return;
    document.querySelector(".debug-step").value = stepId;
    const checkStep = document.querySelector(`#step-${stepId}`);
    let justConstructed = false;
    if (!checkStep) {
      const nextStepData = this.getStepById(stepId);
      if (!nextStepData) {
        console.error("step not found id:", stepId);
        return;
      }
      this.constructStep(nextStepData);
      justConstructed = true;
      this.stepsId.push(stepId);
    }

    this.transitionInProgress = true;
    this.steps.classList.add("hasTransition");
    setTimeout(() => {
      this.transitionInProgress = false;
      this.steps.classList.remove("hasTransition");
      // Remove further steps
      const stepsId = [];
      this.stepsId.map((stepId) => {
        if (this.stepsId.indexOf(stepId) > this.stepsId.indexOf(this.stepId)) {
          if (document.querySelector(`#step-${stepId}`)) {
            document.querySelector(`#step-${stepId}`).remove();
          } else if (document.querySelector(`#${stepId}`))
            document.querySelector(`#${stepId}`).remove();
        } else {
          stepsId.push(stepId);
        }
        return stepId;
      });
      this.stepsId = stepsId;
    }, this.transitionDuration);

    this.hideCurrentStep();
    this.stepId = stepId;
    this.currentStep = document.querySelector(`#step-${this.stepId}`);
    this.offset = this.stepsId.indexOf(stepId);
    this.steps.setAttribute(
      "style",
      `transform:translateY(-${this.offset * window.innerHeight}px)`
    );
    if (justConstructed) {
      this.initCurrentStep();
      this.onResize();
    }
    setTimeout(() => {
      this.showCurrentStep();
    }, this.transitionDuration / 3);

    this.parcoursId = this.getParcoursByStepId(this.stepId);
    switch (this.parcoursId) {
      case 1:
        utag_data.thematique = "réseaux";
        break;
      case 2:
        utag_data.thematique = "eco-gestes";
        break;
      case 3:
        utag_data.thematique = "start-up";
        break;
    }
    this.stepData = this.getStepById(this.stepId);
  }

  onResize() {
    this.main.setAttribute("style", `height:${window.innerHeight}px`);
    Array.prototype.slice
      .call(this.steps.querySelectorAll("section"))
      .map((section) =>
        section.setAttribute("style", `height:${window.innerHeight}px`)
      );
    this.steps.setAttribute(
      "style",
      `transform:translateY(-${this.offset * window.innerHeight}px)`
    );
  }
}
export default SectionNavigator;
