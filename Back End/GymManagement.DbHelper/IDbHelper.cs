using System.Data;

namespace GymManagement.DbHelper
{
    public interface IDbHelper
    {
        DataTable ExecuteQuery(string sql, params object[] parameters);
        int ExecuteNonQuery(string sql, params object[] parameters);
        object ExecuteScalar(string sql, params object[] parameters);
    }
}
