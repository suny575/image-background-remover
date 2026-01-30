// Select elements
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const loader = document.querySelector(".loader");
const resultSection = document.querySelector(".result-section");
const resultImage = document.querySelector(".result-image");
downloadLink.addEventListener("click", (e) => {
  e.preventDefault(); // prevent opening in new tab
  if (!resultImage.src) return;

  const link = document.createElement("a");
  link.href = resultImage.src;
  link.download = "background-removed.png"; // filename for download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  // Send email with EmailJS
  emailjs.send("service_nr140du", "template_cr7h9kq", {
    from_name: name,
    from_email: email,
    message: message
  })
  .then(() => {
    alert("Thank you for contacting us, " + name + "!");
    e.target.reset();
  })
  .catch((err) => {
    console.error(err);
    alert("Something went wrong. Please try again.");
  });
});

// Init free uploads from localStorage
let freeUploads = parseInt(localStorage.getItem("freeUploads")) || 0;

// Upload button click
uploadBtn.addEventListener("click", () => fileInput.click());

// File input change
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/"))
    return alert("Please upload an image file");
  if (file.size > 10 * 1024 * 1024) return alert("Max image size is 10MB");

  // Check free uploads
  if (freeUploads >= 3 && localStorage.getItem("paidUser") !== "starter") {
    return alert(
      "You have used your 3 free images. Please pay via PayPal to continue!",
    );
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = async () => {
    const base64 = reader.result.split(",")[1];

    try {
      loader.style.display = "block";
      uploadBtn.disabled = true;

      const response = await fetch("http://localhost:5000/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error("BG removal failed: " + text);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      resultImage.src = url;
      resultSection.style.display = "block";

      // Free download if under 3 or paid
      if (freeUploads < 3 || localStorage.getItem("paidUser") === "starter") {
        downloadLink.href = url;
        downloadLink.style.pointerEvents = "auto";
        freeUploads++;
        localStorage.setItem("freeUploads", freeUploads);
      } else {
        downloadLink.href = "#";
        downloadLink.style.pointerEvents = "none";
      }

      loader.style.display = "none";
      uploadBtn.disabled = false;
    } catch (err) {
      alert(err.message);
      loader.style.display = "none";
      uploadBtn.disabled = false;
    }
  };
});

// PayPal integration
paypal
  .Buttons({
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            amount: { value: "0.99" },
            description: "Starter Plan - 20 Images",
          },
        ],
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then((details) => {
        alert("Payment successful! Welcome " + details.payer.name.given_name);
        localStorage.setItem("paidUser", "starter");
        localStorage.setItem("freeUploads", 0); // reset free uploads
      });
    },
    onError: (err) => {
      console.error(err);
      alert("Payment failed. Try again.");
    },
  })
  .render("#paypal-starter");

// Contact form
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  console.log("Name:", name, "Email:", email, "Message:", message);
  alert("Thank you for contacting us, " + name + "!");
  e.target.reset();
});
