import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 4px;
`;

export const PostSkeleton = styled(SkeletonBase)`
  height: 120px;
  margin-bottom: 16px;
`;

export const NodeSkeleton = styled(SkeletonBase)`
  height: 80px;
  margin-bottom: 12px;
`;

export const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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