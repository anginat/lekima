// + Địa chỉ email phải bắt đầu bằng 1 ký tự
// + Địa chỉ email là tập hợp của các ký tự a-z, 0-9 và có thể có các ký tự như dấu chấm, dấu gạch dưới
// + Độ dài tối thiểu của email là 5, độ dài tối đa là 32
// + Tên miền của email có thể là tên miền cấp 1 or tên miền cấp 2
export const emailRegex = /^[a-zA-Z][a-zA-Z0-9_.]{1,32}@[a-zA-Z0-9_-]{2,}(\.[a-zA-Z0-9]{2,4}){1,2}$/;

export const numberOnlyRegex = /^\d+$/;

export const phoneNumberRegex = /^\d{8,15}$/;

export const nameRegex = /^[a-zA-Z ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;

export const usernameRegex = /^[a-z0-9\\]*$/;
