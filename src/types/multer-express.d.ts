// Untuk menyamakan tipe file dari multer

import type { File as MulterFile } from 'multer'

declare global {
    namespace Express {
        namespace Multer {
            interface File extends MulterFile { }
        }
    }
}