using System.Data;
using Microsoft.Data.SqlClient;

namespace GymManagement.DbHelper
{
    public class SqlServerHelper : IDbHelper
    {
        private readonly string _connectionString;

        public SqlServerHelper(string connectionString)
        {
            _connectionString = connectionString;
        }

        public DataTable ExecuteQuery(string sql, params object[] parameters)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(sql, conn);
            AddParameters(cmd, parameters);
            
            var dt = new DataTable();
            conn.Open();
            using var reader = cmd.ExecuteReader();
            dt.Load(reader);
            return dt;
        }

        public int ExecuteNonQuery(string sql, params object[] parameters)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(sql, conn);
            AddParameters(cmd, parameters);
            
            conn.Open();
            return cmd.ExecuteNonQuery();
        }

        public object ExecuteScalar(string sql, params object[] parameters)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(sql, conn);
            AddParameters(cmd, parameters);
            
            conn.Open();
            var result = cmd.ExecuteScalar();
            return result ?? DBNull.Value;
        }

        private void AddParameters(SqlCommand cmd, object[] parameters)
        {
            for (int i = 0; i < parameters.Length; i += 2)
            {
                var param = cmd.CreateParameter();
                param.ParameterName = parameters[i].ToString();
                param.Value = parameters[i + 1] ?? DBNull.Value;
                cmd.Parameters.Add(param);
            }
        }
    }
}
