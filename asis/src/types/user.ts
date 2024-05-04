/**
 * 성별 정보
 * F: 여자
 * M: 남자
 */
export type Gender = 'F' | 'M';

export interface User {
  /**
   * 유저 고유 ID
   */
  id: number;
  /**
   * 유저 이름
   */
  name: string;
  /**
   * 유저 나이
   */
  age: string;
  /**
   * 성별 정보
   * F: 여자
   * M: 남자
   */
  gender: Gender;
  /**
   * 사는 지역
   */
  address: string;
  /**
   * 가입 날짜
   */
  join_dt: string;
  /**
   * 등록 날짜
   */
  reg_dt: string;
  /**
   * 수정 날짜
   */
  mod_dt: string;
}

export interface UserWarning {
  /**
   * seqno
   */
  id: string;
  /**
   * 유저 고유 ID
   */
  user_id: string;
  /**
   * 경고 내용
   */
  warning_desc: string;
}
