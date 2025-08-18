package com.fullstack.security.jwt;

import java.security.Key;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.fullstack.controller.OrderController;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

	private final Key key;
	
	public JWTUtil(@Value("${jwt.secret}") String secret) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
	}
	
	public String generateAccessToken(String id, String role, Duration expire) {
		return Jwts.builder()
				.setSubject(id)
				.claim("role", role)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expire.toMillis()))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	public String generateRefreshToken(String id, Duration expire) {
		return Jwts.builder()
				.setSubject(id)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expire.toMillis()))
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	// 토큰에서 ID 추출
	public String getId(String token) {
		
		String ids  = parseClaims(token).getSubject();
		
		return parseClaims(token).getSubject();
	}
	
	// 토큰에서 role 추출
	public String getRole(String token) {
		return parseClaims(token).get("role", String.class);
	}
	
	// 만료 시간
	public LocalDateTime getExpiration(String token) {
	    return parseClaims(token)
	            .getExpiration()
	            .toInstant()
	            .atZone(ZoneId.systemDefault())
	            .toLocalDateTime();
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
