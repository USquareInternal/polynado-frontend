import Swal from "sweetalert2";

const baseStyles = {
    background: "#ffffff",
    buttonsStyling: false,
    customClass: {
        popup: "swal-popup-clean",
        confirmButton: "swal-btn fw-semibold px-5 py-2",
        title: "mt-2 mb-1 swal-title",
        htmlContainer: "m-0 swal-text",
        actions: "mt-3",
    },
};

export const showSuccessAlert = (message: string) => {
    Swal.fire({
        icon: "success",
        title: `<span class="fw-semibold text-dark">Success</span>`,
        html: `<p class="text-muted m-0 p-0">${message}</p>`,
        confirmButtonText: "OK",
        iconColor: "#22c55e",
        ...baseStyles,
        customClass: {
            ...baseStyles.customClass,
            confirmButton: "btn btn-success swal-btn fw-semibold px-5 py-2",
        },
    });
};

export const showFailedAlert = (message: string) => {
    Swal.fire({
        icon: "error",
        title: `<span class="fw-semibold text-dark">Failed</span>`,
        html: `<p class="text-muted m-0 p-0">${message}</p>`,
        confirmButtonText: "OK",
        iconColor: "#ef4444",
        ...baseStyles,
        customClass: {
            ...baseStyles.customClass,
            confirmButton: "btn btn-danger swal-btn fw-semibold px-5 py-2",
        },
    });
};

export const showWarningAlert = (message: string) => {
    Swal.fire({
        icon: "warning",
        title: `<span class="fw-semibold text-dark">Warning</span>`,
        html: `<p class="text-muted m-0 p-0">${message}</p>`,
        confirmButtonText: "OK",
        iconColor: "#f59e0b",
        ...baseStyles,
        customClass: {
            ...baseStyles.customClass,
            confirmButton:
                "btn btn-warning text-dark swal-btn fw-semibold px-5 py-2",
        },
    });
};

