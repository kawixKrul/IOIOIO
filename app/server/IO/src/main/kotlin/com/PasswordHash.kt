package com

import at.favre.lib.crypto.bcrypt.BCrypt

fun hashPassword(password: String): String =
    BCrypt.withDefaults().hashToString(12, password.toCharArray())

fun verifyPassword(password: String, hash: String): Boolean =
    BCrypt.verifyer().verify(password.toCharArray(), hash).verified