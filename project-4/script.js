/* ================================
   REUSABLE MODAL TOGGLE FUNCTION
================================ */
function toggleModal(openBtnId, modalId, closeBtnIds = []) {
  const modal = document.getElementById(modalId);
  const openBtn = document.getElementById(openBtnId);

  if (!modal || !openBtn) return;

  // OPEN MODAL
  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  // CLOSE MODAL (X or Cancel buttons)
  closeBtnIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      });
    }
  });

  // CLOSE ON BACKDROP CLICK
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });
}

/* ================================
   1️⃣ POST JOB MODAL
================================ */
toggleModal(
  "openPostJob",
  "postJobModal",
  ["closePostJob", "cancelPostJob"]
);

/* ================================
   2️⃣ RECRUITER LOGIN MODAL
================================ */
toggleModal(
  "loginRecruiterBtn",
  "recruiterLoginModal",
  ["closeRecruiterLogin", "cancelRecruiterLogin"]
);

/* ================================
   3️⃣ JOB SEEKER LOGIN MODAL
================================ */
toggleModal(
  "loginSeekerBtn",
  "jobSeekerLoginModal",
  ["closeJobSeekerLogin", "cancelJobSeekerLogin"]
);
