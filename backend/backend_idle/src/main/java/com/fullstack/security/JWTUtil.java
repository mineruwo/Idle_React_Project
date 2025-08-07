package com.fullstack.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

	private final Key key;
	private final long expiration = 1000 * 60 * 60; // 1시간
	
	public JWTUtil(@Value("${jwt.secret}") String secret) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes()); 
	}
	
	public String generateToken(String id, String role) {
		return Jwts.builder()
				.setSubject(id)
				.claim("role", role)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expiration))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	// 토큰에서 ID 추출
	public String getId(String token) {
		return parseClaims(token).getSubject();
	}
	
	// 토큰에서 role 추출
	public String getRole(String token) {
		return parseClaims(token).get("role", String.class);
	}
	
	// 토큰 유효성
	public boolean validateToken(String token) {
		try {
			parseClaims(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}
	
	private Claims parseClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
	
}
