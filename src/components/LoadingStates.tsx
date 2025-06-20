import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: var(--radius-lg);
`;

export const PostSkeleton = styled(SkeletonBase)`
  height: 120px;
  margin-bottom: var(--space-4);
`;

export const NodeSkeleton = styled(SkeletonBase)`
  height: 80px;
  margin-bottom: var(--space-3);
`;

export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

export const LoadingState: React.FC<{ type: 'posts' | 'nodes'; count?: number }> = ({ 
  type, 
  count = 3 
}) => (
  <div>
    {Array.from({ length: count }, (_, i) => (
      type === 'posts' ? <PostSkeleton key={i} /> : <NodeSkeleton key={i} />
    ))}
  </div>
); 