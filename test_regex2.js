const str = "VALUES (21, 2, 'Phòng trọ gần đại học FPT', 'Đẹp\n', '123 Đoàn Ngọc Nhạc')";
console.log(str.replace(/(?<!N)('(?:[^']|'')*')/g, 'N$1'));
